import { ToolId } from "../shared/types";
import { clientHotbar, draggingAtom } from "./atoms";

export function swapToolsId(toolId: ToolId, toolId2: ToolId) {
	clientHotbar((current) => {
		let foundSlot = -1;
		let foundSlot2 = -1;

		for (const [slot, id] of current) {
			if (id === toolId) {
				foundSlot = slot;
			}

			if (id === toolId2) {
				foundSlot2 = slot;
			}
		}

		if (foundSlot !== -1 && foundSlot2 !== -1) {
			const clone = table.clone(current);
			clone.set(foundSlot, toolId2);
			clone.set(foundSlot2, toolId);

			return clone;
		} else return current;
	});
}

export function dragTool(toolId: ToolId | undefined) {
	draggingAtom(toolId);
}
