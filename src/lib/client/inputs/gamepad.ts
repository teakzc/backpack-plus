import { CollectionService, GuiService } from "@rbxts/services";
import { backpackSelectionAtom, consoleSwapAtom, inventoryVisibleAtom } from "../atoms";
import { swapSlots } from "../tools";

/**
 * Focus the first hotbar slot on gamepad, matching satchel's
 * `GuiService.SelectedObject = HotbarFrame:FindFirstChild("1")` when the
 * inventory opens. Picks the selectable hotbar slot with the lowest SelectionOrder.
 * @hidden
 */
export function focusFirstHotbarSlot() {
	let best: ImageButton | undefined = undefined;
	let bestOrder = math.huge;

	for (const instance of CollectionService.GetTagged("backpack-HotbarSlotButton")) {
		if (instance.IsA("ImageButton") && instance.Selectable && instance.SelectionOrder < bestOrder) {
			bestOrder = instance.SelectionOrder;
			best = instance;
		}
	}

	if (best !== undefined) GuiService.SelectedObject = best;
}

/**
 * Clear gamepad selection if it currently sits on a backpack slot, matching
 * satchel's `disableGamepadInventoryControl` on close.
 * @hidden
 */
export function clearBackpackSelection() {
	const selected = GuiService.SelectedObject;
	if (selected !== undefined && CollectionService.HasTag(selected, "backpack-SlotButton")) {
		GuiService.SelectedObject = undefined;
	}
}

/** B: cancel an in-progress A-button pickup, otherwise close the inventory. */
function cancel() {
	if (consoleSwapAtom() !== undefined) {
		consoleSwapAtom(undefined);
		return;
	}

	if (inventoryVisibleAtom()) inventoryVisibleAtom(false);
}

/** X: move the focused hotbar slot's tool to the inventory. */
function removeFromHotbar() {
	const focused = backpackSelectionAtom();
	// A number means a hotbar slot is focused (inventory slots don't set this).
	if (typeIs(focused, "number")) swapSlots(focused, "Inventory");
}

/**
 * @hidden
 */
export function gamepadInputHelper(input: InputObject) {
	if (input.KeyCode === Enum.KeyCode.ButtonB) cancel();
	else if (input.KeyCode === Enum.KeyCode.ButtonX) removeFromHotbar();
}
