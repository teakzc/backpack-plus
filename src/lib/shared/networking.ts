import { Atom } from "@rbxts/charm";
import { Client, createRemotes, remote, Server } from "@rbxts/remo";
import { SyncPayload } from "@rbxts/charm-sync";
import { ClientBackpacks } from "./types";

export type backpackSyncPayload = SyncPayload<{
	clientBackpacks: Atom<ClientBackpacks>;
}>;

/**
 * Sync remotes using `@rbxts/remo`
 */
export const backpackRemotes = createRemotes({
	syncState: remote<Client, [payload: backpackSyncPayload]>(),
	requestState: remote<Server>(),
	requestEquip: remote<Server, [toolId: string]>(),
});
