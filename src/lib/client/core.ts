import { observe } from "@rbxts/charm";
import { client } from "@rbxts/charm-sync";
import { GuiService, StarterGui, UserInputService } from "@rbxts/services";
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
import { applySettings, backpackSettings, BackpackSettings } from "./settings";
import { equipTool, findToolFromSlot } from "./tools";

export function configureBackpack(settings: Partial<BackpackSettings>) {
	applySettings(settings);
}

function observeBackpack(_tool: ToolPlus, toolId: ToolId) {
	// Find for free slot.

	let hotbarSlot = -1;

	const clientHotbarValue = clientHotbar();
	for (let slot = 1; slot <= backpackSettings().slots; slot++) {
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
			print("debug", draggingAtom());
		}

		clientBackpackOrder((current) => removeValue(current, toolId));
	};
}

export function initializeBackpackClient() {
	StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

	clientHotbar((current) => {
		const clone = table.clone(current);

		for (let i = 1; i <= backpackSettings().slots; i++) {
			if (!clone.has(i)) {
				clone.set(i, "Empty");
			}
		}

		return clone;
	});

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

	const uiFolder = script.Parent?.WaitForChild("ui");
	if (uiFolder === undefined) return;

	const base = uiFolder.WaitForChild("base");
	if (base === undefined) return;

	const styleDerive = base.FindFirstChildOfClass("StyleDerive");
	if (styleDerive === undefined) return;

	const tokens = uiFolder.FindFirstChild("tokens");
	if (tokens === undefined) return;

	styleDerive.StyleSheet = tokens as StyleSheet;

	tokens.SetAttribute("TextSize", GuiService.IsTenFootInterface() ? "$TextSizeBig" : "$TextSizeSmall");
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
 * Helper function for equipping tools from 0-9
 * @param toggleBackquote Whether to bind `Backquote` to open inventory
 * @returns Disconnect function
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
