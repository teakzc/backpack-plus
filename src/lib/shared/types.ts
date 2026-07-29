/**
 * A tool in a player's backpack. `metadata` is free-form and is what filters and
 * decorators query against.
 */
export interface ToolPlus<T = Record<string, unknown>> {
	name: string;
	icon: string;
	tooltip: string;
	metadata: T;
	instance?: Tool;
}

/** Unique id for a tool, assigned by `giveTool`. Unique per server session. */
export type ToolId = string;

/** One player's backpack: everything they own, plus what they have equipped. */
export type ClientBackpack = {
	equip: ToolId;
	backpack: Map<ToolId, ToolPlus>;
};

/** Every player's backpack, keyed by player name. */
export type ClientBackpacks = Map<string, ClientBackpack>;

/**
 * Sync payload shape as the server holds it, keyed per client.
 * @hidden
 */
export type SyncBackpackGetter = {
	[key: `backpackplus-${string}`]: () => ClientBackpack;
};

/**
 * Sync payload shape after `normalizePayload` flattens the per-client key.
 * @hidden
 */
export type BackpackNormalizedGetter = {
	backpackplus: () => ClientBackpack;
};
