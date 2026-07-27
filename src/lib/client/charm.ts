import { signal } from "@rbxts/charm";
import { ClientBackpack, ToolId } from "@/shared/types";

const [clientBackpack, updateClientBackpack] = signal<ClientBackpack>({
	equip: "",
	backpack: new Map(),
});

/**
 * Reads the client's backpack state, synced from the server.
 *
 * backpack: `ToolId` that the client owns
 * equip: `ToolId` of the currently equipped tool.
 * @client
 */
export const getClientBackpack = clientBackpack;

/**
 * Replaces the client's backpack state. Normally written by the sync layer —
 * prefer the server-side tool APIs to change what a player is carrying.
 * @client
 */
export const setClientBackpack = updateClientBackpack;

const [clientHotbar, updateClientHotbar] = signal(new Map<number, ToolId | "Drag" | "Empty">());

/**
 * Reads the hotbar slots of ToolId, "Drag", or "Empty", keyed by slot number 1 to 10.
 * Tools that fit in hotbar slots are stored here, while overflow tools go to `getClientBackpackOrder`.
 * @client
 */
export const getClientHotbar = clientHotbar;

/**
 * Replaces the hotbar slot map. Accepts either a new map or an updater
 * receiving the current one.
 * @client
 */
export const setClientHotbar = updateClientHotbar;

const [clientBackpackOrder, updateClientBackpackOrder] = signal<Array<ToolId>>([]);

/**
 * Reads the overflow tools that don't fit in hotbar slots.
 * Also tracks "Drag" placeholder for dragging.
 * @client
 */
export const getClientBackpackOrder = clientBackpackOrder;

/**
 * Replaces the overflow tool order. Accepts either a new array or an updater
 * receiving the current one.
 * @client
 */
export const setClientBackpackOrder = updateClientBackpackOrder;

const [draggingState, updateDraggingState] = signal<
	| {
			id: ToolId;
			offset: Vector2;
			from: number | "Inventory";
			inputObject?: InputObject;
	  }
	| undefined
>(undefined);

/**
 * Reads the in-flight drag: the tool being dragged, mouse offset, source
 * slot/location, and input object. Undefined when not dragging.
 * @client
 */
export const getDraggingState = draggingState;

/**
 * Starts a drag, or ends one by passing `undefined`.
 * @client
 */
export const setDraggingState = updateDraggingState;

const [inventoryVisibility, updateInventoryVisibility] = signal<boolean>(false);

/**
 * Reads whether the inventory is currently open.
 * @client
 */
export const getInventoryVisibility = inventoryVisibility;

/**
 * Opens or closes the inventory.
 * @client
 */
export const setInventoryVisibility = updateInventoryVisibility;

const [backpackSelection, updateBackpackSelection] = signal<number | "Inventory" | undefined>(undefined);

/**
 * Reads what the client is currently hovering over in the backpack: a hotbar
 * slot number, the inventory panel, or `undefined` when nothing is hovered.
 * @client
 */
export const getBackpackSelection = backpackSelection;

/**
 * Sets the hovered target, or clears it by passing `undefined`.
 * @client
 */
export const setBackpackSelection = updateBackpackSelection;

/**
 * Predicate function for filtering tools by their metadata.
 * @template T The shape of the metadata object.
 * @client
 */
export type BackpackFilterFn<T = Record<string, unknown>> = (metadata: T) => boolean;

const [backpackFilters, updateBackpackFilters] = signal(new Map<string, BackpackFilterFn>());

/**
 * Reads the registered filter functions, keyed by filter name.
 * Used to dynamically show/hide tools in the inventory grid based on metadata.
 * @client
 */
export const getBackpackFilters = backpackFilters;

/**
 * Replaces the filter map. Prefer `addFilter` / `removeFilter`, which handle
 * the keying for you.
 * @client
 */
export const setBackpackFilters = updateBackpackFilters;

const [consoleSwap, updateConsoleSwap] = signal<number | ToolId | undefined>();

/**
 * Reads the "picked up" source during a console (A-button) swap: a hotbar slot
 * number (tool or empty), or an inventory tool id. Undefined when nothing is held.
 * @client
 */
export const getConsoleSwap = consoleSwap;

/**
 * Picks up a swap source, or clears it by passing `undefined`.
 * @client
 */
export const setConsoleSwap = updateConsoleSwap;
