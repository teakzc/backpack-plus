import {
	getBackpackSelection,
	getClientBackpack,
	getClientHotbar,
	getDraggingState,
	setBackpackSelection,
	setClientBackpackOrder,
	setClientHotbar,
	setDraggingState,
} from "@/client/charm";
import { getBackpackSettings } from "@/client/settings";
import { UserInputService } from "@rbxts/services";
import { removeValue, set as setArray } from "@rbxts/sift/out/Array";
import { set } from "@rbxts/sift/out/Dictionary";
import { ToolId } from "@/shared/types";
import { RequestEquip } from "@/client/networking";

/**
 * Swaps two tool slots in the hotbar.
 *
 * @param slot1 Position of the first tool.
 * @param slot2 Position of the second tool.
 * @client
 */
export function swapSlotsHotbar(slot1: number, slot2: number) {
	setClientHotbar((current) => {
		const clone = table.clone(current);
		const a = clone.get(slot1) ?? "Empty";
		const b = clone.get(slot2) ?? "Empty";
		clone.set(slot1, b);
		clone.set(slot2, a);
		return clone;
	});
}

/**
 * Places or swaps a "picked up" source (console A-button flow) onto a target.
 *
 * `picked` identifies the source: a hotbar slot number (tool or empty), or an
 * inventory tool id. `target` is a hotbar slot number, a specific inventory tool
 * id, or the generic "Inventory" (move into overflow, no specific tool).
 *
 * - hotbar → hotbar: swaps the two slots (empty included).
 * - hotbar → "Inventory": moves the slot's tool to overflow (empty slot is a no-op).
 * - hotbar → inventory tool: swaps the slot with that tool (tool moves up, slot's tool drops into the tool's old spot).
 * - inventory tool → hotbar: drops into the slot, sending any occupant back to overflow.
 * - inventory tool → inventory tool: swaps their positions in the inventory order.
 *
 * @param picked The picked-up source — a hotbar slot number, or an inventory tool id.
 * @param target The destination — a hotbar slot number, an inventory tool id, or "Inventory".
 * @hidden
 * @client
 */
export function swapSlots(picked: number | ToolId, target: number | ToolId | "Inventory") {
	// A referenced inventory tool may have been removed server-side while "held"
	// (console flow); placing its dead id would leave a ghost hotbar entry.
	const backpack = getClientBackpack().backpack;
	if (!typeIs(picked, "number") && !backpack.has(picked)) return;
	if (!typeIs(target, "number") && target !== "Inventory" && !backpack.has(target)) return;

	if (typeIs(picked, "number")) {
		// Picked a hotbar slot (may be empty).
		if (target === "Inventory") {
			// Move the slot's tool into the inventory overflow.
			const id = getClientHotbar().get(picked);
			if (id !== undefined && id !== "Empty" && id !== "Drag") {
				setClientHotbar((current) => set(current, picked, "Empty"));
				setClientBackpackOrder((current) => [...current, id]);
			}
		} else if (typeIs(target, "number")) {
			// Swap two hotbar slots.
			swapSlotsHotbar(picked, target);
		} else {
			// Swap a hotbar slot with an inventory tool: the tool moves up into the
			// slot, the slot's tool drops into the tool's old position in overflow.
			const hotbarTool = getClientHotbar().get(picked);
			setClientHotbar((current) => set(current, picked, target));
			setClientBackpackOrder((current) => {
				const index = current.findIndex((id) => id === target);
				if (index === -1) return current;
				if (hotbarTool !== undefined && hotbarTool !== "Empty" && hotbarTool !== "Drag") {
					return setArray(current, index + 1, hotbarTool);
				}
				return removeValue(current, target);
			});
		}
		return;
	}

	// Picked an inventory tool.
	if (target === "Inventory") return;

	if (typeIs(target, "number")) {
		// Drop the inventory tool into a hotbar slot; a displaced occupant takes the
		// picked tool's old position in the inventory order (mirrors the drag flow).
		const displaced = getClientHotbar().get(target);
		setClientHotbar((current) => set(current, target, picked));
		setClientBackpackOrder((current) => {
			const index = current.findIndex((id) => id === picked);
			if (index === -1) return current;
			if (displaced !== undefined && displaced !== "Empty" && displaced !== "Drag") {
				// sift Array.set is 1-based; findIndex is 0-based.
				return setArray(current, index + 1, displaced);
			}
			return removeValue(current, picked);
		});
		return;
	}

	// Both are inventory tools: swap their positions in the inventory order.
	setClientBackpackOrder((current) => {
		const i = current.findIndex((id) => id === picked);
		const j = current.findIndex((id) => id === target);
		if (i === -1 || j === -1) return current;
		// sift Array.set is 1-based; findIndex is 0-based.
		return setArray(setArray(current, i + 1, target), j + 1, picked);
	});
}

/**
 * Finds the tool's location
 *
 * number: slot in hotbar
 * "Inventory": inventory
 *
 * @param toolId The `ToolId` to find.
 * @returns The location.
 * @client
 */
export function findToolLocation(toolId: ToolId): number | "Inventory" | undefined {
	const hotbar = getClientHotbar();
	for (const [slot, id] of hotbar) {
		if (id === toolId) {
			return slot;
		}
	}

	const backpack = getClientBackpack().backpack;
	return backpack.get(toolId) !== undefined ? "Inventory" : undefined;
}

/**
 * Finds the `ToolId` from the slot number in the hotbar
 *
 * `ToolId` can also be "Empty" or "Drag" depending.
 *
 * @param slot Slot number in the hotbar
 * @returns `ToolId` or undefined if there is no tool.
 * @client
 */
export function findToolFromSlot(slot: number): ToolId | "Drag" | "Empty" | undefined {
	return getClientHotbar().get(slot);
}

/**
 * Starts dragging a tool.
 *
 * @param toolId The tool to drag.
 * @param offset Mouse offet from slot for calculations.
 * @param inputObject The current dragging `InputObject` to dfferientiate mobile touches.
 * @client
 */
export function dragTool(toolId: ToolId, offset: Vector2, inputObject?: InputObject) {
	const from = findToolLocation(toolId);
	if (from === undefined) return;

	setDraggingState({ id: toolId, offset: offset, from: from, inputObject });
	setBackpackSelection(undefined);

	if (typeOf(from) === "number") {
		setClientHotbar((current) => {
			const clone = table.clone(current);

			for (const [slot, id] of clone) {
				if (id === toolId) {
					clone.set(slot, "Drag");
					break;
				}
			}

			return clone;
		});
	} else {
		setClientBackpackOrder((current) => {
			const index = current.findIndex((id) => id === toolId);
			if (index === -1) return current;
			return setArray(current, index + 1, "Drag");
		});
	}

	const cleanup = UserInputService.InputEnded.Connect((input) => {
		// must be left click
		const click = input.UserInputType === Enum.UserInputType.MouseButton1;
		// or if touch must be same touch
		const touch = input.UserInputType === Enum.UserInputType.Touch && input === inputObject;

		if (!click && !touch) return;

		undragTool();
		cleanup.Disconnect();
	});
}

/** Replaces the "Drag" placeholder in the inventory order with the given id, if present. */
function replaceDragPlaceholder(id: ToolId) {
	setClientBackpackOrder((current) => {
		const index = current.findIndex((entry) => entry === "Drag");
		if (index === -1) return current;
		// sift Array.set is 1-based; findIndex is 0-based.
		return setArray(current, index + 1, id);
	});
}

/**
 * Undrags the currently dragged tool.
 * @client
 */
export function undragTool() {
	const data = getDraggingState();

	if (data === undefined) return;

	// Ignore a selection pointing past the current slot count: dropping there would
	// write the tool into a slot the hotbar doesn't lay out, leaving it stranded
	// outside both hotbar and inventory. Treated as "dropped on nothing".
	const rawSelection = getBackpackSelection();
	const selection =
		typeIs(rawSelection, "number") && rawSelection > getBackpackSettings().slots ? undefined : rawSelection;

	setDraggingState(undefined);

	if (typeIs(data.from, "number")) {
		if (selection === "Inventory") {
			setClientBackpackOrder((current) => [...current, data.id]);
			setClientHotbar((current) => set(current, data.from, "Empty"));

			return;
		}

		setClientHotbar((current) => set(current, data.from, data.id));

		if (typeIs(selection, "number")) {
			swapSlotsHotbar(data.from, selection);
		}
	} else {
		if (selection === undefined || selection === "Inventory") {
			replaceDragPlaceholder(data.id);
			return;
		}

		const displaced = getClientHotbar().get(selection);

		if (displaced === undefined || displaced === "Empty") {
			// Slot is empty — just move tool there
			setClientBackpackOrder((current) => removeValue(current, "Drag"));
		} else {
			// Slot is occupied — swap
			replaceDragPlaceholder(displaced);
		}

		setClientHotbar((current) => set(current, selection, data.id));
	}
}

/**
 * Sends a event to the server to equip a tool
 *
 * @param toolId The tool to equip.
 * @client
 */
export function equipTool(toolId: ToolId) {
	RequestEquip.fire(toolId);
}
