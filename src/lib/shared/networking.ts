import { atom, Atom } from "@rbxts/charm";
import { SyncPayload } from "@rbxts/charm-sync";
import { Client, createRemotes, remote, Server } from "@rbxts/remo";
import { tool } from "../server";
import { t } from "@rbxts/t";

export type clientBackpack = tool[];
export type clientRegistry = {
	[client: string]: clientBackpack;
};
export type equippedRegistry = {
	[client: string]: tool | undefined;
};

export const clientRegistry = atom<clientRegistry>({});

export const equippedRegistry = atom<equippedRegistry>({});

export type backpackSyncPayload = SyncPayload<{
	clientRegistry: Atom<clientRegistry>;
	equippedRegistry: Atom<equippedRegistry>;
}>;

const toolValidator = t.strictInterface({
	image: t.optional(t.string),
	tooltip: t.optional(t.string),
	tool: t.optional(t.Instance),
	id: t.number,
	name: t.optional(t.string),
	metadata: t.any, // It would be t.map(t.string, t.unknown), but some limitations
}) as t.check<tool>;

/**
 * Sync remotes using `@rbxts/remo`!
 *
 * @hidden
 */
export const backpackSyncRemotes = createRemotes(
	{
		syncState: remote<Client, [payload: backpackSyncPayload]>(),
		requestState: remote<Server>(),
		equipTool: remote<Server, [tool: tool | undefined]>(t.optional(toolValidator)).returns(t.boolean),
	},
	//loggerMiddleware,
);
