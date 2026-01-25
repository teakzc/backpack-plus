import { client } from "@rbxts/charm-sync";
import { clientInventory } from "../server";
import { atom } from "@rbxts/charm";
import { inventorySyncRemotes } from "../shared/networking";

const clientInventory = atom<clientInventory>([]);

const clientSyncer = client({
	atoms: {
		clientRegistry: clientInventory,
	},
    ignoreUnhydrated: true
});

inventorySyncRemotes.syncState.
