import {
	getClientBackpack,
	getClientHotbar,
	getDraggingState,
	setClientBackpack,
	setClientBackpackOrder,
	setClientHotbar,
	setDraggingState,
} from "@/client/charm";
import { initializeTopbarIcon } from "@/client/icon";
import { consoleInputHelper, gamepadInputHelper, keyboardInputHelper } from "@/client/inputs";
import { RequestState, SyncState } from "@/client/networking";
import { getBackpackSettings } from "@/client/settings";
import { BackpackNormalizedGetter, ToolId, ToolPlus } from "@/shared/types";
import { observe } from "@rbxts/charm";
import { client } from "@rbxts/charm-sync";
import { StarterGui, UserInputService } from "@rbxts/services";
import { removeValue } from "@rbxts/sift/out/Array";
import { set } from "@rbxts/sift/out/Dictionary";

function observeBackpack(_tool: ToolPlus, toolId: ToolId) {
	// Find for free slot.

	let hotbarSlot = -1;

	const clientHotbarValue = getClientHotbar();
	for (let slot = 1; slot <= getBackpackSettings().slots; slot++) {
		// clientHotbarValue is a Map, so it is not shifted from 1 to 0 index.
		// We can thus directly index it with the slot number.
		if (clientHotbarValue.get(slot) === undefined || clientHotbarValue.get(slot) === "Empty") {
			hotbarSlot = slot;
			break;
		}
	}

	if (hotbarSlot !== -1) {
		setClientHotbar((current) => set(current, hotbarSlot, toolId));
	} else {
		setClientBackpackOrder((current) => [...current, toolId]);
	}

	return () => {
		setClientHotbar((current) => {
			for (const [slot, id] of current) {
				if (id === toolId) return set(current, slot, "Empty");
				if (id === "Drag") {
					const data = getDraggingState();
					if (data?.from === slot) return set(current, slot, "Empty");
				}
			}

			return current;
		});

		const dragging = getDraggingState();
		if (dragging?.id === toolId) {
			setDraggingState(undefined);
		}

		setClientBackpackOrder((current) => removeValue(current, toolId));
	};
}

let initialized = false;

/**
 * Initializes the backpack-plus client. Calling it again is a no-op.
 * @client
 */
export function initializeBackpackClient() {
	if (initialized) return;
	initialized = true;

	StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

	initializeTopbarIcon();

	client.addSignals({
		backpackplus: setClientBackpack,
	});

	SyncState.setCallback((payload) => {
		// Fix types later D:
		client.patch<BackpackNormalizedGetter, false>(payload as never);
	});

	RequestState.fire();

	observe(() => getClientBackpack().backpack, observeBackpack);

	UserInputService.InputBegan.Connect((input, gpe) => {
		if (gpe) return;

		keyboardInputHelper(input);
		consoleInputHelper(input);
		gamepadInputHelper(input);
	});

	print(`backpack-plus @ v2.0.0-rc.1 loaded successfully!`);
}
