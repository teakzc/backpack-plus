import { CollectionService, ReplicatedStorage } from "@rbxts/services";
import { set } from "@rbxts/sift/out/Dictionary";
import { ToolId, ToolPlus } from "@/shared/types";
import { generateId } from "@/shared/utils/id";
import { modifyPlayer } from "@/server/clients";
import { toolClientMap, toolMap, toolRegistry } from "@/server/data";

let toolStorage = new Instance("Folder");
toolStorage.Parent = ReplicatedStorage;
toolStorage.Name = "backpackplus-storage";

/**
 * Gives the client a new tool.
 *
 * Any data can be added to metadata, which can be used for querying and custom decorating.
 * All data changes is synced to the client.
 *
 * Instance is the `Tool`, it is cloned and parented to the client when held. If not it is stored in ReplicatedStorage in a folder.
 *
 * @param client The client to give the tool to
 * @param toolData The tool data to assign the new tool
 * @returns `ToolId`
 * @server
 */
export function giveTool(client: Player, toolData: Partial<ToolPlus>): ToolId {
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

/**
 * Removes a tool from the client.
 * Deletes the cloned `Tool` instance and removes all `ToolId`s from all tables.
 *
 * @param client The client to remove from
 * @param toolId The tool's id
 * @server
 */
export function removeTool(client: Player, toolId: ToolId) {
	modifyPlayer(client, (backpack) => set(backpack, "backpack", set(backpack.backpack, toolId, undefined)));
	toolRegistry.get(toolId)?.Destroy();
	toolRegistry.delete(toolId);
	toolMap.delete(toolId);
	toolClientMap.delete(toolId);
}

/**
 * Update the tooldata either by replacing it or the transform function.
 *
 * @param client The client
 * @param toolId The tool
 * @param transform new `ToolPlus` or transform function
 * @server
 */
export function updateTool(client: Player, toolId: ToolId, transform: ToolPlus | ((toolData: ToolPlus) => ToolPlus)) {
	modifyPlayer(client, (backpack) => {
		const tool = backpack.backpack.get(toolId);
		if (!tool) return backpack;

		const newTool = typeIs(transform, "function") ? transform(tool) : transform;
		return set(backpack, "backpack", set(backpack.backpack, toolId, newTool));
	});
}

/**
 * Returns the `Tool` instance that the client owns.
 *
 * @param toolId The tool id
 * @param client The client
 * @returns `Tool`
 * @server
 */
function getToolInstance(client: Player, toolId: string) {
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

/**
 * Makes the client equip the tool.
 *
 * @param client The client
 * @param toolId The tool
 * @server
 */
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

	const toolInstance = getToolInstance(client, toolId);
	if (!toolInstance) return;

	toolInstance.Parent = client.Character;
}
