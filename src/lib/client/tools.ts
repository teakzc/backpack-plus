import { UserInputService } from "@rbxts/services";
import { removeValue, set as setArray } from "@rbxts/sift/out/Array";
import { set } from "@rbxts/sift/out/Dictionary";
import { ToolId } from "../shared/types";
import { backpackSelectionAtom, clientBackpack, clientBackpackOrder, clientHotbar, draggingAtom } from "./atoms";
import { RequestEquip } from "./networking";

export function swapSlots(slot1: number, slot2: number) {
	clientHotbar((current) => {
		const clone = table.clone(current);
		const a = clone.get(slot1) ?? "Empty";
		const b = clone.get(slot2) ?? "Empty";
		clone.set(slot1, b);
		clone.set(slot2, a);
		return clone;
	});
}

export function findToolLocation(toolId: ToolId): number | "Backpack" | undefined {
	const hotbar = clientHotbar();
	for (const [slot, id] of hotbar) {
		if (id === toolId) {
			return slot;
		}
	}

	const backpack = clientBackpack().backpack;
	return backpack.get(toolId) !== undefined ? "Backpack" : undefined;
}

export function findToolFromSlot(slot: number): ToolId | undefined {
	return clientHotbar().get(slot);
}

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
			swapSlots(data.from, selection);
		}
	} else {
		// data.from --> "Backpack"

		if (selection === undefined || selection === "Inventory") {
			clientBackpackOrder((current) => {
				const check = current.findIndex((id) => id === "Drag") !== -1;
				if (check) return setArray(current, current.findIndex((id) => id === "Drag") + 1, data.id);
				return current;
			});

			return;
		}

		if (typeIs(selection, "number")) {
			const displaced = clientHotbar().get(selection);

			if (displaced === undefined || displaced === "Empty") {
				// Slot is empty — just move tool there
				clientBackpackOrder((current) => removeValue(current, "Drag"));
				clientHotbar((current) => set(current, selection, data.id));
			} else {
				// Slot is occupied — swap
				clientBackpackOrder((current) => {
					const check = current.findIndex((id) => id === "Drag") !== -1;
					if (check) return setArray(current, current.findIndex((id) => id === "Drag") + 1, displaced);

					return current;
				});
				clientHotbar((current) => set(current, selection, data.id));
			}
		}
	}
}

export function equipTool(toolId: ToolId) {
	RequestEquip.fire(toolId);
}
