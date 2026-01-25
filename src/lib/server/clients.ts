import { atom } from "@rbxts/charm";
import { tool } from "./tools";

export type clientInventory = tool[];

const clientRegistry = atom<Map<Player, clientInventory>>(new Map());

/**
 * Sets up a client for adding tools to their inventory.
 *
 * @param client The client to setup
 */
export function register_client(client: Player) {
	clientRegistry((current) => {
		const cloned = table.clone(current);
		cloned.set(client, []);

		return cloned;
	});
}

/**
 * Retrieve client's inventory
 *
 * @param client The client to retrieve
 * @returns The client's inventory of tools
 */
export function retrieve_client(client: Player) {
	return clientRegistry().get(client) ?? [];
}

/**
 * Update client's inventory
 *
 * @param client The client to modify
 * @param modifiedInventory The updated inventory
 */
export function modify_client(client: Player, modifiedInventory: tool[]) {
	clientRegistry((current) => {
		const cloned = table.clone(current);
		cloned.set(client, modifiedInventory);

		return cloned;
	});
}

/**
 * Remove a clients inventory
 *
 * @param client The client to remove
 */
export function clear_client(client: Player) {
	clientRegistry((current) => {
		const cloned = table.clone(current);
		cloned.set(client, []);

		return cloned;
	});
}

/**
 * Remove the client, should be called when a player leaves
 *
 * @param client The client to remove
 */
export function remove_client(client: Player) {
	clientRegistry((current) => {
		const cloned = table.clone(current);
		cloned.delete(client);

		return cloned;
	});
}

/**
 * Removes everyone
 */
export function remove_all() {
	clientRegistry(new Map());
}
