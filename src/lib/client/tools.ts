import { UserInputService } from "@rbxts/services";
import { removeValue, set as setArray } from "@rbxts/sift/out/Array";
import { set } from "@rbxts/sift/out/Dictionary";
import { ToolId } from "../shared/types";
import { backpackSelectionAtom, clientBackpack, clientBackpackOrder, clientHotbar, draggingAtom } from "./atoms";
import { RequestEquip } from "./networking";

/**
 * Swaps two tool slots in the hotbar.
 *
 * @param slot1 Position of the first tool.
 * @param slot2 Position of the second tool.
 * @client
 */
export function swapSlotsHotbar(slot1: number, slot2: number) {
	clientHotbar((current) => {
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
	const backpack = clientBackpack().backpack;
	if (!typeIs(picked, "number") && !backpack.has(picked)) return;
	if (!typeIs(target, "number") && target !== "Inventory" && !backpack.has(target)) return;

	if (typeIs(picked, "number")) {
		// Picked a hotbar slot (may be empty).
		if (target === "Inventory") {
			// Move the slot's tool into the inventory overflow.
			const id = clientHotbar().get(picked);
			if (id !== undefined && id !== "Empty" && id !== "Drag") {
				clientHotbar((current) => set(current, picked, "Empty"));
				clientBackpackOrder((current) => [...current, id]);
			}
		} else if (typeIs(target, "number")) {
			// Swap two hotbar slots.
			swapSlotsHotbar(picked, target);
		} else {
			// Swap a hotbar slot with an inventory tool: the tool moves up into the
			// slot, the slot's tool drops into the tool's old position in overflow.
			const hotbarTool = clientHotbar().get(picked);
			clientHotbar((current) => set(current, picked, target));
			clientBackpackOrder((current) => {
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
		const displaced = clientHotbar().get(target);
		clientHotbar((current) => set(current, target, picked));
		clientBackpackOrder((current) => {
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
	clientBackpackOrder((current) => {
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
	const hotbar = clientHotbar();
	for (const [slot, id] of hotbar) {
		if (id === toolId) {
			return slot;
		}
	}

	const backpack = clientBackpack().backpack;
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
	return clientHotbar().get(slot);
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

	draggingAtom({ id: toolId, offset: offset, from: from, inputObject });
	backpackSelectionAtom(undefined);

	if (typeOf(from) === "number") {
		clientHotbar((current) => {
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
		clientBackpackOrder((current) => {
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
	clientBackpackOrder((current) => {
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
	const data = draggingAtom();

	if (data === undefined) return;

	const selection = backpackSelectionAtom();
	draggingAtom(undefined);

	if (typeIs(data.from, "number")) {
		if (selection === "Inventory") {
			clientBackpackOrder((current) => [...current, data.id]);
			clientHotbar((current) => set(current, data.from, "Empty"));

			return;
		}

		clientHotbar((current) => set(current, data.from, data.id));

		if (typeIs(selection, "number")) {
			swapSlotsHotbar(data.from, selection);
		}
	} else {
		if (selection === undefined || selection === "Inventory") {
			replaceDragPlaceholder(data.id);
			return;
		}

		const displaced = clientHotbar().get(selection);

		if (displaced === undefined || displaced === "Empty") {
			// Slot is empty — just move tool there
			clientBackpackOrder((current) => removeValue(current, "Drag"));
		} else {
			// Slot is occupied — swap
			replaceDragPlaceholder(displaced);
		}

		clientHotbar((current) => set(current, selection, data.id));
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
