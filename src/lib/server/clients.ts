import { server } from "@rbxts/charm-sync";
import { clientInventory, clientRegistry, inventorySyncPayload, inventorySyncRemotes } from "../shared/networking";

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
export function retrieve_client(client: Player) {
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
			clientRegistry: payload.data.clientRegistry && {
				[client.Name]: payload.data.clientRegistry[client.Name],
			},
		},
	};
}

const syncer = server({
	atoms: {
		clientRegistry: clientRegistry,
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
