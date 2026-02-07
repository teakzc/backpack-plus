import { server } from "@rbxts/charm-sync";
import {
	clientBackpack,
	clientRegistry,
	equippedRegistry,
	backpackSyncPayload,
	backpackSyncRemotes,
} from "../shared/networking";
import { set } from "@rbxts/sift/out/Dictionary";
import { CollectionService } from "@rbxts/services";

/**
 * Sets up a client for adding tools to their backpack.
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
 * Retrieve client's backpack
 *
 * @param client The client to retrieve
 * @returns The client's backpack of tools
 */
export function retrieve_client(client: Player): clientBackpack | undefined {
	return clientRegistry()[client.Name];
}

/**
 * Update client's backpack by passing the new backpack
 *
 * Warning: Updates must be immutable, as this package uses `@rbxts/charm` for internal state management
 *
 * @param client The client to modify
 * @param modifiedBackpack A callback that passes the `clientBackpack` state and should return a `clientBackpack`
 */
export function modify_client(client: Player, modifiedBackpack: (current: clientBackpack) => clientBackpack) {
	clientRegistry((current) => {
		const clientBackpack = retrieve_client(client);

		if (!clientBackpack) {
			warn("Client does not exist within the registry! (retrieve_client returned nil)");

			return current;
		}

		const cloned = table.clone(current);
		cloned[client.Name] = modifiedBackpack(clientBackpack);

		return cloned;
	});
}

/**
 * Remove a clients backpack
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
 * [INFO]
 * - Here lies the sync logic using `charm-sync`
 * - Comment out during jest-testing...
 */

function filterPayload(client: Player, payload: backpackSyncPayload): backpackSyncPayload {
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
	backpackSyncRemotes.syncState.fire(client, filterPayload(client, payload));
});

backpackSyncRemotes.requestState.connect((client) => {
	syncer.hydrate(client);
});

backpackSyncRemotes.equipTool.onRequest((client, tool) => {
	// Check if they have the tool

	const backpack = retrieve_client(client);

	if (!backpack) return false;

	CollectionService.GetTagged(`BACKPACK_PLUS_${client.Name}`).forEach((tool) => tool.Destroy());

	if (tool === undefined) {
		equippedRegistry((current) => set(current, client.Name, undefined));

		return true;
	}

	const index = backpack.findIndex((V) => V.id === tool.id);

	if (index !== -1 && index !== undefined) {
		// Set equipped
		equippedRegistry((current) => set(current, client.Name, tool));

		// Give tool

		if (tool.tool) {
			const clone = tool.tool.Clone();
			clone.Parent = client.Character;

			CollectionService.AddTag(clone, `BACKPACK_PLUS_${client.Name}`);
		}

		return true;
	}

	// Did not find, so no

	return false;
});
