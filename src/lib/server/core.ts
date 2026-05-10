import { server } from "@rbxts/charm-sync";
import { clientBackpacks } from "./atoms";
import { backpackRemotes, backpackSyncPayload } from "../shared/networking";

export function initializeBackpackServer() {
	const syncer = server({
		atoms: {
			clientBackpacks: clientBackpacks,
		},
		interval: 0,
		preserveHistory: false,
		autoSerialize: true,
	});

	syncer.connect((client, payload) => {
		backpackRemotes.syncState.fire(client, filterPayload(client, payload));
	});

	backpackRemotes.requestState.connect((client) => {
		syncer.hydrate(client);
	});

	backpackRemotes.requestEquip.connect((client, toolId) => {
		// TODO: Implement equip logic
	});
}

function filterPayload(client: Player, payload: backpackSyncPayload): backpackSyncPayload {
	if (payload.type === "init") {
		return {
			...payload,
			data: {
				...payload.data,
				clientBackpacks: new Map([
					[client.Name, (payload.data.clientBackpacks as unknown as Map<string, unknown>).get(client.Name)],
				]) as never,
			},
		};
	}

	return {
		...payload,
		data: {
			...payload.data,
			clientBackpacks:
				payload.data.clientBackpacks &&
				(new Map([
					[client.Name, (payload.data.clientBackpacks as unknown as Map<string, unknown>).get(client.Name)],
				]) as never),
		},
	};
}
