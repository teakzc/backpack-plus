import { Atom } from "@rbxts/charm";
import { SyncPayload } from "@rbxts/charm-sync";

import { ToolId, ToolPlus } from "./types";

export type ClientBackpack = {
	equip: ToolId;
	backpack: Map<ToolId, ToolPlus>;
};

export type ClientBackpacks = Map<string, ClientBackpack>;

export type backpackSyncPayload = SyncPayload<{
	clientBackpacks: Atom<ClientBackpacks>;
}>;

export type zapSyncPayload = {
	["data"]: {
		["clientBackpacks"]: Map<
			string,
			{
				["backpack"]: Map<
					string,
					{
						["metadata"]: Map<string, unknown>;
						["name"]: string;
						["icon"]: string;
						["tooltip"]: string;
						["instance"]?: Tool;
					}
				>;
				["equip"]: string;
			}
		>;
	};
	["type"]: "init" | "patch";
};
