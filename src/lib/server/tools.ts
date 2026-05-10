import { set } from "@rbxts/sift/out/Dictionary";
import { ToolPlus } from "../shared/types";
import { modifyPlayer } from "./clients";
import { generateId } from "../shared/utils/id";

export function giveTool(client: Player, toolData: Partial<ToolPlus>) {
	const id = generateId();
	modifyPlayer(client, (backpack) => set(backpack, id, toolData));

	return id;
}

export function removeTool(client: Player, toolId: string) {
	modifyPlayer(client, (backpack) => set(backpack, toolId, undefined));
}

export function updateTool(client: Player, toolId: string, transform: ToolPlus | ((toolData: ToolPlus) => ToolPlus)) {
	modifyPlayer(client, (backpack) => {
		const tool = backpack.get(toolId);
		if (!tool) return backpack;

		const newTool = typeIs(transform, "function") ? transform(tool) : transform;
		return set(backpack, toolId, newTool);
	});
}
