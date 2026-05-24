import { server } from "@rbxts/charm-sync";
import { set } from "@rbxts/sift/out/Dictionary";
import { backpackSyncPayload, zapSyncPayload } from "../shared/networking";
import { clientBackpacks } from "./atoms";
import { modifyPlayer } from "./clients";
import { RequestEquip, RequestState, SyncState } from "./networking";
import { holdTool } from "./tools";

export function initializeBackpackServer() {
	const syncer = server({
		atoms: {
			clientBackpacks: clientBackpacks,
		},
		interval: 0,
		preserveHistory: false,
		autoSerialize: false,
	});

	syncer.connect((client, payload) => {
		SyncState.fire(client, filterPayload(client, payload));
	});

	RequestState.on((client) => {
		syncer.hydrate(client);
	});

	RequestEquip.on((client, toolId) => {
		const backpack = clientBackpacks().get(client.Name);
		if (!backpack) return;

		if (!backpack.backpack.has(toolId)) return;

		if (backpack.equip === toolId) {
			modifyPlayer(client, (backpack) => set(backpack, "equip", ""));
			holdTool(client, undefined);

			return;
		}

		holdTool(client, toolId);
		modifyPlayer(client, (backpack) => set(backpack, "equip", toolId));
	});
}

function filterPayload(client: Player, payload: backpackSyncPayload): zapSyncPayload {
	const backpacks = payload.data.clientBackpacks as unknown as Map<string, unknown>;
	const playerSlice = new Map([[client.Name, backpacks.get(client.Name)]]);

	return {
		type: payload.type,
		data: { clientBackpacks: playerSlice },
	} as unknown as zapSyncPayload;
}
