import { client } from "@rbxts/charm-sync";
import { _clientBackpacks, clientBackpack, clientHotbar } from "./atoms";
import { backpackRemotes } from "../shared/networking";
import { StarterGui } from "@rbxts/services";
import { observe } from "@rbxts/charm";
import { set } from "@rbxts/sift/out/Dictionary";
import { ToolPlus, ToolId } from "../shared/types";
import { applySettings, backpackSettings, BackpackSettings } from "./settings";

export function configureBackpack(settings: Partial<BackpackSettings>) {
	applySettings(settings);
}

function observeBackpack(_tool: ToolPlus, toolId: ToolId) {
	// Find for free slot.

	let hotbarSlot = -1;

	const clientHotbarValue = clientHotbar();
	for (let slot = 1; slot <= 10; slot++) {
		// clientHotbarValue is a Map, so it is not shifted from 1 to 0 index.
		// We can thus directly index it with the slot number.
		if (clientHotbarValue.get(slot) === undefined) {
			hotbarSlot = slot;
			break;
		}
	}

	if (hotbarSlot !== -1) clientHotbar((current) => set(current, hotbarSlot, toolId));

	return () => {
		clientHotbar((current) => {
			for (const [slot, id] of current) {
				if (id === toolId) return set(current, slot, undefined);
			}

			return current;
		});
	};
}

export function initializeBackpackClient() {
	StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

	const syncer = client({
		atoms: {
			clientBackpacks: _clientBackpacks,
		},
		ignoreUnhydrated: true,
	});

	backpackRemotes.syncState.connect((payload) => {
		syncer.sync(payload);
	});

	backpackRemotes.requestState.fire();

	observe(clientBackpack, observeBackpack);

	const uiFolder = script.Parent?.WaitForChild("ui");
	if (uiFolder === undefined) return;

	const styleDerive = uiFolder.WaitForChild("base").FindFirstChildOfClass("StyleDerive");
	if (styleDerive === undefined) return;

	const tokens = uiFolder.FindFirstChild("tokens");
	if (tokens === undefined) return;

	styleDerive.StyleSheet = tokens as StyleSheet;
}
