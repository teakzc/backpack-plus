import { computed } from "@rbxts/charm";
import { config, server } from "@rbxts/charm-sync";
import { set } from "@rbxts/sift/out/Dictionary";

import { SyncBackpackGetter } from "@/shared/types";

import { getClientBackpacks } from "@/server/charm";
import { modifyPlayer } from "@/server/clients";
import { RequestEquip, RequestState, SyncState } from "@/server/networking";
import { holdTool } from "@/server/tools";

/**
 * Initializes the backpack-plus server
 * @server
 */
export function initializeBackpackServer() {
	config.fixArrays = false;

	RequestState.on((client) => {
		server.addSignalsToClient(client, {
			[`backpackplus-${client.Name}`]: computed(() => {
				return getClientBackpacks().get(client.Name);
			}),
		});
	});

	server.connect<SyncBackpackGetter, false>((client, payload) => {
		SyncState.fire(client, payload);
	});

	RequestEquip.on((client, toolId) => {
		const backpack = getClientBackpacks().get(client.Name);
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
