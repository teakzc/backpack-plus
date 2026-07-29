import { ToolId } from "@/shared/types";
import { getClientBackpack, getClientHotbar } from "@/client/charm";
import { getBackpackSettings } from "@/client/settings";
import { equipTool } from "@/client/tools";

// Window for treating two L1/R1 presses as simultaneous (→ unequip), and the
// debounce delay before a single press actually cycles. Matches satchel's
// `maxEquipDeltaTime`.
const maxEquipDeltaTime = 0.06;

let lastInput: InputObject | undefined = undefined;
let lastInputTime = 0;
let lastEquippedSlot: number | undefined = undefined;

function isTool(id: ToolId | "Drag" | "Empty" | undefined): id is ToolId {
	return id !== undefined && id !== "Empty" && id !== "Drag" && id !== "";
}

/** Unequip whatever is currently held. `equipTool` toggles, so re-fire the equipped id. */
function unequip() {
	const equipped = getClientBackpack().equip;
	if (isTool(equipped)) equipTool(equipped);
}

/**
 * Cycle the equipped hotbar tool, ported from satchel's `changeToolFunc`.
 *
 * - L1 steps backwards, R1 steps forwards.
 * - Stepping off the first/last tool (no tool before the edge) unequips.
 * - Pressing L1 and R1 within `maxEquipDeltaTime` unequips.
 */
function changeTool(input: InputObject) {
	const direction = input.KeyCode === Enum.KeyCode.ButtonL1 ? -1 : 1;

	// Opposite shoulder pressed within the window → unequip. (Both inputs here are
	// always L1 or R1, so a differing KeyCode means one of each.)
	if (
		lastInput !== undefined &&
		lastInput.KeyCode !== input.KeyCode &&
		os.clock() - lastInputTime <= maxEquipDeltaTime
	) {
		unequip();
		lastEquippedSlot = undefined;
		lastInput = input;
		lastInputTime = os.clock();
		return;
	}

	lastInput = input;
	lastInputTime = os.clock();

	// Defer so a paired L1/R1 press within the window can pre-empt this one.
	task.delay(maxEquipDeltaTime, () => {
		if (lastInput !== input) return;

		const slots = getBackpackSettings().slots;
		const hotbar = getClientHotbar();
		const equipped = getClientBackpack().equip;

		const toolAt = (slot: number) => {
			const id = hotbar.get(slot);
			return isTool(id) ? id : undefined;
		};
		const selectfn = (slot: number, id: ToolId) => {
			lastEquippedSlot = slot;
			equipTool(id);
		};

		// The currently equipped hotbar slot, if the equipped tool lives in one.
		let current: number | undefined = undefined;
		if (isTool(equipped)) {
			for (let i = 1; i <= slots; i++) {
				if (toolAt(i) === equipped) {
					current = i;
					break;
				}
			}
		}

		if (current !== undefined) {
			// Nearest tool in `direction` before an edge; no tool before the edge → unequip.
			for (let p = current + direction; p >= 1 && p <= slots; p += direction) {
				const id = toolAt(p);
				if (id !== undefined) return selectfn(p, id);
			}
			unequip();

			lastEquippedSlot = undefined;
			return;
		}

		// Nothing equipped: re-equip the last slot, else the first tool from the end.
		const last = lastEquippedSlot !== undefined ? toolAt(lastEquippedSlot) : undefined;
		if (last !== undefined) return selectfn(lastEquippedSlot!, last);

		const start = direction === -1 ? slots : 1;
		for (let p = start; p >= 1 && p <= slots; p += direction) {
			const id = toolAt(p);
			if (id !== undefined) return selectfn(p, id);
		}
	});
}

/**
 * @hidden
 * @client
 */
export function consoleInputHelper(input: InputObject) {
	if (input.KeyCode === Enum.KeyCode.ButtonL1 || input.KeyCode === Enum.KeyCode.ButtonR1) {
		changeTool(input);
	}
}
