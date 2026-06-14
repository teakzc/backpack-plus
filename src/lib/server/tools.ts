import { CollectionService, ReplicatedStorage } from "@rbxts/services";
import { set } from "@rbxts/sift/out/Dictionary";
import { ToolId, ToolPlus } from "../shared/types";
import { generateId } from "../shared/utils/id";
import { modifyPlayer } from "./clients";
import { toolClientMap, toolMap, toolRegistry } from "./data";
let toolStorage = new Instance("Folder");
toolStorage.Parent = ReplicatedStorage;
toolStorage.Name = "backpackplus-storage";

export function giveTool(client: Player, toolData: Partial<ToolPlus>) {
	const id = generateId();
	const tool: ToolPlus = {
		name: toolData.name ?? "",
		icon: toolData.icon ?? "",
		tooltip: toolData.tooltip ?? "",
		metadata: toolData.metadata ?? {},
		instance: toolData.instance,
	};

	toolMap.set(id, tool);
	toolClientMap.set(id, client);

	modifyPlayer(client, (backpack) => set(backpack, "backpack", set(backpack.backpack, id, tool)));

	return id;
}

export function removeTool(client: Player, toolId: ToolId) {
	modifyPlayer(client, (backpack) => set(backpack, "backpack", set(backpack.backpack, toolId, undefined)));
	toolRegistry.get(toolId)?.Destroy();
	toolRegistry.delete(toolId);
	toolMap.delete(toolId);
	toolClientMap.delete(toolId);
}

export function updateTool(client: Player, toolId: ToolId, transform: ToolPlus | ((toolData: ToolPlus) => ToolPlus)) {
	modifyPlayer(client, (backpack) => {
		const tool = backpack.backpack.get(toolId);
		if (!tool) return backpack;

		const newTool = typeIs(transform, "function") ? transform(tool) : transform;
		return set(backpack, "backpack", set(backpack.backpack, toolId, newTool));
	});
}

function getToolInstance(toolId: string, client: Player) {
	const tool = toolMap.get(toolId);
	if (!tool) return;

	let toolInstance = toolRegistry.get(toolId);
	if (!toolInstance) {
		const clone = tool.instance?.Clone();

		if (clone) {
			CollectionService.AddTag(clone, `backpack-${client.Name}`);

			toolRegistry.set(toolId, clone);
			toolInstance = clone;
		} else return;
	}

	return toolInstance;
}

export function holdTool(client: Player, toolId?: ToolId) {
	CollectionService.GetTagged(`backpack-${client.Name}`).forEach((v) => {
		if (toolStorage === undefined) {
			toolStorage = new Instance("Folder");
			toolStorage.Parent = ReplicatedStorage;
			toolStorage.Name = "backpackplus-storage";
		}

		v.Parent = toolStorage;
	});

	if (!toolId) return;

	if (client.Character === undefined) return;

	const toolInstance = getToolInstance(toolId, client);
	if (!toolInstance) return;

	toolInstance.Parent = client.Character;
}
