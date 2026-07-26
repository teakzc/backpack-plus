import { backpackSelectionAtom, inventoryVisibleAtom } from "../atoms";
import { equipTool, findToolFromSlot } from "../tools";

const slotKeys = {
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

/** Close the inventory when clicking/tapping outside any slot. */
function closeOnClick(input: InputObject) {
	const clicked =
		input.UserInputType === Enum.UserInputType.MouseButton1 || input.UserInputType === Enum.UserInputType.Touch;

	if (clicked && backpackSelectionAtom() === undefined) {
		inventoryVisibleAtom(false);
	}
}

/** Equip the hotbar tool bound to the pressed number key (1-9, 0 -> slot 10). */
function equipFromKey(input: InputObject) {
	const slot = slotKeys[input.KeyCode.Name as keyof typeof slotKeys] as number | undefined;
	if (slot === undefined || slot < 1 || slot > 10) return;

	const id = findToolFromSlot(slot);
	if (id) equipTool(id);
}

/**
 * @hidden
 */
export function keyboardInputHelper(input: InputObject) {
	closeOnClick(input);
	equipFromKey(input);
}
