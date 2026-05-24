import { CollectionService, ReplicatedStorage } from "@rbxts/services";
import { set } from "@rbxts/sift/out/Dictionary";
import { ToolId, ToolPlus } from "../shared/types";
import { generateId } from "../shared/utils/id";
import { clientBackpacks } from "./atoms";
import { modifyPlayer } from "./clients";

export function giveTool(client: Player, toolData: Partial<ToolPlus>) {
	const id = generateId();
	const tool: ToolPlus = {
		name: toolData.name ?? "",
		icon: toolData.icon ?? "",
		tooltip: toolData.tooltip ?? "",
		metadata: toolData.metadata ?? {},
		instance: toolData.instance,
	};
	modifyPlayer(client, (backpack) => set(backpack, "backpack", set(backpack.backpack, id, tool)));

	return id;
}

export function removeTool(client: Player, toolId: string) {
	modifyPlayer(client, (backpack) => set(backpack, "backpack", set(backpack.backpack, toolId, undefined)));
}

export function updateTool(client: Player, toolId: string, transform: ToolPlus | ((toolData: ToolPlus) => ToolPlus)) {
	modifyPlayer(client, (backpack) => {
		const tool = backpack.backpack.get(toolId);
		if (!tool) return backpack;

		const newTool = typeIs(transform, "function") ? transform(tool) : transform;
		return set(backpack, "backpack", set(backpack.backpack, toolId, newTool));
	});
}

const toolRegistry = new Map<ToolId, Tool>();
const toolStorage = new Instance("Folder");
toolStorage.Parent = ReplicatedStorage;
toolStorage.Name = "backpackplus-storage";

export function holdTool(client: Player, toolId?: string) {
	CollectionService.GetTagged(`backpack-${client.Name}`).forEach((V) => (V.Parent = toolStorage));

	if (!toolId) {
		return;
	}

	const backpack = clientBackpacks().get(client.Name)?.backpack;
	if (!backpack) return;

	const tool = backpack.get(toolId);
	if (!tool) return;

	let toolInstance = toolRegistry.get(toolId);
	if (!toolInstance) {
		const clone = tool.instance?.Clone();

		if (clone) {
			toolRegistry.set(toolId, clone);
			toolInstance = clone;
		} else return;
	}

	CollectionService.AddTag(toolInstance, `backpack-${client.Name}`);
	toolInstance.Parent = client.Character;
}
/**
 * Actual issues
 * 1. client.Character may be nil (line65): If the player is respawning, this throws. Needs a guard before parenting.
 * 2. toolRegistry leaks on removeTool: Removed tools are never evicted from toolRegistry or toolStorage. Over time these orphaned instances accumulate.
 * 3. Module-level side effect (lines 37–38): toolStorage folder is created at require time, not inside initializeBackpackServer().
 * 4. Tag not cleaned up on removeTool: The CollectionService tag on a removed tool's instance is never removed, so future GetTagged calls may return stale instances.
 * 5. V naming: minor — non-standard uppercase callback parameter.
 *
 * The rest of my previous review stands except bug #1 which I retract — unequip correctly sends tools to toolStorage, not destroy them.
 */
