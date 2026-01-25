import { client } from "@rbxts/charm-sync";
import { clientRegistry, inventorySyncRemotes } from "../shared/networking";
import { computed } from "@rbxts/charm";
import { Players } from "@rbxts/services";

export const inventory = computed(() => {
	return clientRegistry()[Players.LocalPlayer.Name] ?? [];
});

const clientSyncer = client({
	atoms: {
		clientRegistry: clientRegistry,
	},
	ignoreUnhydrated: true,
});

inventorySyncRemotes.syncState.connect((payload) => {
	clientSyncer.sync(payload);
});

inventorySyncRemotes.requestState.fire();
