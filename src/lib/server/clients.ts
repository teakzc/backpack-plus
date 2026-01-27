import { server } from "@rbxts/charm-sync";
import {
	clientInventory,
	clientRegistry,
	equippedRegistry,
	inventorySyncPayload,
	inventorySyncRemotes,
} from "../shared/networking";
import { set } from "@rbxts/sift/out/Dictionary";

/**
 * Sets up a client for adding tools to their inventory.
 *
 * @param client The client to setup
 */
export function register_client(client: Player) {
	clientRegistry((current) => {
		const cloned = table.clone(current);
		cloned[client.Name] = [];

		return cloned;
	});
}

/**
 * Retrieve client's inventory
 *
 * @param client The client to retrieve
 * @returns The client's inventory of tools
 */
export function retrieve_client(client: Player): clientInventory | undefined {
	return clientRegistry()[client.Name];
}

/**
 * Update client's inventory by passing the new inventory
 *
 * Warning: Updates must be immutable, as this package uses `@rbxts/charm` for internal state management
 *
 * @param client The client to modify
 * @param modifiedInventory A callback that passes the `clientInventory` state and should return a `clientInventory`
 */
export function modify_client(client: Player, modifiedInventory: (current: clientInventory) => clientInventory) {
	clientRegistry((current) => {
		const clientInventory = retrieve_client(client);

		if (!clientInventory) {
			warn("Client does not exist within the registry! (retrieve_client returned nil)");

			return current;
		}

		const cloned = table.clone(current);
		cloned[client.Name] = modifiedInventory(clientInventory);

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
		cloned[client.Name] = [];

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
		cloned[client.Name] = undefined!;

		return cloned;
	});
}

/**
 * Removes everyone
 */
export function remove_all() {
	clientRegistry({});
}

/**
 * SYNC SECTION
 */

function filterPayload(client: Player, payload: inventorySyncPayload): inventorySyncPayload {
	if (payload.type === "init") {
		return {
			...payload,
			data: {
				...payload.data,
				equippedRegistry: {
					[client.Name]: payload.data.equippedRegistry[client.Name],
				},
				clientRegistry: {
					[client.Name]: payload.data.clientRegistry[client.Name],
				},
			},
		};
	}

	return {
		...payload,
		data: {
			...payload.data,
			equippedRegistry: payload.data.equippedRegistry && {
				[client.Name]: payload.data.equippedRegistry[client.Name],
			},
			clientRegistry: payload.data.clientRegistry && {
				[client.Name]: payload.data.clientRegistry[client.Name],
			},
		},
	};
}

const syncer = server({
	atoms: {
		clientRegistry: clientRegistry,
		equippedRegistry: equippedRegistry,
	},
	interval: 0,
	preserveHistory: false,
	autoSerialize: true,
});

syncer.connect((client, payload) => {
	inventorySyncRemotes.syncState.fire(client, filterPayload(client, payload));
});

inventorySyncRemotes.requestState.connect((client) => {
	syncer.hydrate(client);
});

inventorySyncRemotes.equipTool.onRequest((client, tool) => {
	// Check if they have the tool

	const inventory = retrieve_client(client);

	if (!inventory) return false;

	if (tool === undefined) {
		equippedRegistry((current) => set(current, client.Name, undefined));

		// Remove model
		client.Character?.FindFirstChild("EQUIPPED_TOOL_MODEL")?.Destroy();

		return true;
	}

	const index = inventory.findIndex((V) => V.id === tool.id);

	if (index !== -1 && index !== undefined) {
		// Set equipped
		equippedRegistry((current) => set(current, client.Name, tool));

		// Give model

		if (tool.model) {
			const clone = tool.model.Clone();
			clone.Parent = client.Character;
			clone.Name = "EQUIPPED_TOOL_MODEL";
		}

		return true;
	}

	// Did not find, so no

	return false;
});
