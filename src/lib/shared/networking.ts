import { atom, Atom } from "@rbxts/charm";
import { SyncPayload } from "@rbxts/charm-sync";
import { Client, createRemotes, remote, Server } from "@rbxts/remo";
import { tool } from "../server";
import { t } from "@rbxts/t";

export type clientInventory = tool[];
export type clientRegistry = {
	[client: string]: clientInventory;
};
export type equippedRegistry = {
	[client: string]: tool | undefined;
};

export const clientRegistry = atom<clientRegistry>({});

export const equippedRegistry = atom<equippedRegistry>({});

export type inventorySyncPayload = SyncPayload<{
	clientRegistry: Atom<clientRegistry>;
	equippedRegistry: Atom<equippedRegistry>;
}>;

const toolValidator = t.strictInterface({
	image: t.optional(t.string),
	tooltip: t.optional(t.string),
	model: t.optional(t.Instance),
	id: t.number,
	name: t.optional(t.string),
}) as t.check<tool>;

export const inventorySyncRemotes = createRemotes(
	{
		syncState: remote<Client, [payload: inventorySyncPayload]>(),
		requestState: remote<Server>(),
		equipTool: remote<Server, [tool: tool | undefined]>(t.optional(toolValidator)).returns(t.boolean),
	},
	//loggerMiddleware,
);
