import { observe } from "@rbxts/charm";
import { client } from "@rbxts/charm-sync";
import { StarterGui, UserInputService } from "@rbxts/services";
import { removeValue } from "@rbxts/sift/out/Array";
import { set } from "@rbxts/sift/out/Dictionary";
import { backpackSyncPayload } from "../shared/networking";
import { ToolId, ToolPlus } from "../shared/types";
import {
	_clientBackpacks,
	backpackSelectionAtom,
	clientBackpack,
	clientBackpackOrder,
	clientHotbar,
	draggingAtom,
	inventoryVisibleAtom,
} from "./atoms";
import { RequestState, SyncState } from "./networking";
import { backpackSettingsAtom } from "./settings";
import { equipTool, findToolFromSlot } from "./tools";

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

/**
 * Initializes the backpack-plus client.
 * @client
 */
export function initializeBackpackClient() {
	StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

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

	print(`backpack-plus @ v2.0.0 loaded successfully!`);
}

const inputs = {
	Zero: 10,
	One: 1,
	Two: 2,
	Three: 3,
	Four: 4,
	Five: 5,
	Six: 6,
	Seven: 7,
	Eight: 8,
	Nine: 9,
};

/**
 * Helper function for equipping tools from 0-9.
 * @param toggleBackquote Whether to bind `Backquote` to open inventory.
 * @returns Cleanup function.
 * @client
 */
export function backpackInputHelper(toggleBackquote?: boolean) {
	const connection = UserInputService.InputBegan.Connect((input, GPE) => {
		if (GPE) return;

		if (input.KeyCode === Enum.KeyCode.Backquote && toggleBackquote) inventoryVisibleAtom((current) => !current);

		if (input.UserInputType === Enum.UserInputType.MouseButton1 || input.UserInputType === Enum.UserInputType.Touch)
			if (backpackSelectionAtom() === undefined) inventoryVisibleAtom(false);

		const validation = inputs[input.KeyCode.Name as keyof typeof inputs] as number | undefined;

		if (validation === undefined) return;
		if (validation > 10 || validation < 1) return;

		const id = findToolFromSlot(validation);

		if (id) {
			equipTool(id);
		}
	});

	return () => connection.Disconnect();
}
