import { server } from "@rbxts/charm-sync";
import { set } from "@rbxts/sift/out/Dictionary";
import { ClientBackpack, ToolId, ToolPlus } from "@/shared/types";
import { getClientBackpacks, setClientBackpacks } from "@/server/charm";
import { toolClientMap, toolMap, toolRegistry } from "@/server/data";

/**
 * Registers a player's backpack data
 * @param client The player to register
 * @server
 */
export function registerPlayer(client: Player) {
	setClientBackpacks((current) => {
		return set(current, client.Name, { backpack: new Map<string, ToolPlus>(), equip: "" });
	});
}

/**
 * Unregisters a player's backpack data, and removes data from registries to clear up memory.
 * @param client The player to unregister
 * @server
 */
export function unregisterPlayer(client: Player) {
	const toolIds = getBackpack(client)?.backpack;
	if (toolIds) {
		for (const [id] of toolIds) {
			toolRegistry.get(id)?.Destroy();
			toolRegistry.delete(id);
			toolMap.delete(id);
			toolClientMap.delete(id);
		}
	}

	setClientBackpacks((current) => {
		return set(current, client.Name, undefined);
	});

	server.removeClient(client);
}

/**
 * Modifies a player's backpack data
 * @param client The player to modify
 * @param callback The callback to modify the backpack
 * @server
 */
export function modifyPlayer(client: Player, callback: (backpack: ClientBackpack) => ClientBackpack) {
	setClientBackpacks((current) => {
		const clientBackpack = current.get(client.Name);

		if (!clientBackpack) {
			return current;
		}

		return set(current, client.Name, callback(clientBackpack));
	});
}

/**
 * Returns the client's backpack
 *
 * @param client
 * @returns `ClientBackpack`
 * @server
 */
export function getBackpack(client: Player) {
	return getClientBackpacks().get(client.Name);
}

/**
 * Gets the client that owns the `ToolId`
 * @param toolId The tool to check
 * @returns The `Player` or undefined.
 * @server
 */
export function getClientOwnership(toolId: ToolId): Player | undefined {
	return toolClientMap.get(toolId);
}
