import { observe } from "@rbxts/charm";
import { client } from "@rbxts/charm-sync";
import { StarterGui, UserInputService } from "@rbxts/services";
import { removeValue } from "@rbxts/sift/out/Array";
import { set } from "@rbxts/sift/out/Dictionary";
import { backpackSyncPayload } from "../shared/networking";
import { ToolId, ToolPlus } from "../shared/types";
import { _clientBackpacks, clientBackpack, clientBackpackOrder, clientHotbar, draggingAtom } from "./atoms";
import { initializeTopbarIcon } from "./icon";
import { consoleInputHelper, gamepadInputHelper, keyboardInputHelper } from "./inputs";
import { RequestState, SyncState } from "./networking";
import { backpackSettingsAtom } from "./settings";

function observeBackpack(_tool: ToolPlus, toolId: ToolId) {
	// Find for free slot.

	let hotbarSlot = -1;

	const clientHotbarValue = clientHotbar();
	for (let slot = 1; slot <= backpackSettingsAtom().slots; slot++) {
		// clientHotbarValue is a Map, so it is not shifted from 1 to 0 index.
		// We can thus directly index it with the slot number.
		if (clientHotbarValue.get(slot) === undefined || clientHotbarValue.get(slot) === "Empty") {
			hotbarSlot = slot;
			break;
		}
	}

	if (hotbarSlot !== -1) {
		clientHotbar((current) => set(current, hotbarSlot, toolId));
	} else {
		clientBackpackOrder((current) => [...current, toolId]);
	}

	return () => {
		clientHotbar((current) => {
			for (const [slot, id] of current) {
				if (id === toolId) return set(current, slot, "Empty");
				if (id === "Drag") {
					const data = draggingAtom();
					if (data?.from === slot) return set(current, slot, "Empty");
				}
			}

			return current;
		});

		const dragging = draggingAtom();
		if (dragging?.id === toolId) {
			draggingAtom(undefined);
		}

		clientBackpackOrder((current) => removeValue(current, toolId));
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

	const syncer = client({
		atoms: {
			clientBackpacks: _clientBackpacks,
		},
		ignoreUnhydrated: true,
	});

	SyncState.setCallback((payload) => {
		syncer.sync(payload as unknown as backpackSyncPayload);
	});

	RequestState.fire();

	observe(() => clientBackpack().backpack, observeBackpack);

	UserInputService.InputBegan.Connect((input, gpe) => {
		if (gpe) return;

		keyboardInputHelper(input);
		consoleInputHelper(input);
		gamepadInputHelper(input);
	});

	print(`backpack-plus @ v2.0.0-rc.1 loaded successfully!`);
}
