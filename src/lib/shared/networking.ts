import { Atom } from "@rbxts/charm";
import { SyncPayload } from "@rbxts/charm-sync";
import { Client, createRemotes, loggerMiddleware, remote } from "@rbxts/remo";
import { clientRegistry } from "../server";

export type inventorySyncPayload = SyncPayload<{
	clientRegistry: Atom<clientRegistry>;
}>;

export const inventorySyncRemotes = createRemotes({
	syncState: remote<Client, [payload: inventorySyncPayload]>(),
}, loggerMiddleware);
