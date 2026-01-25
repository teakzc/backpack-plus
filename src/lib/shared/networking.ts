import { atom, Atom } from "@rbxts/charm";
import { SyncPayload } from "@rbxts/charm-sync";
import { Client, createRemotes, loggerMiddleware, remote, Server } from "@rbxts/remo";
import { tool } from "../server";

export type clientInventory = tool[];
export type clientRegistry = {
	[client: string]: clientInventory;
};

export const clientRegistry = atom<clientRegistry>({});

export type inventorySyncPayload = SyncPayload<{
	clientRegistry: Atom<clientRegistry>;
}>;

export const inventorySyncRemotes = createRemotes(
	{
		syncState: remote<Client, [payload: inventorySyncPayload]>(),
		requestState: remote<Server>(),
	},
	loggerMiddleware,
);
