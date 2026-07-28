export interface ToolPlus<T = Record<string, unknown>> {
	name: string;
	icon: string;
	tooltip: string;
	metadata: T;
	instance?: Tool;
}

export type ToolId = string;

export type ClientBackpack = {
	equip: ToolId;
	backpack: Map<ToolId, ToolPlus>;
};

export type ClientBackpacks = Map<string, ClientBackpack>;

export type SyncBackpackGetter = {
	[key: `backpackplus-${string}`]: () => ClientBackpack;
};

export type BackpackNormalizedGetter = {
	backpackplus: () => ClientBackpack;
};
