import { atom, computed } from "@rbxts/charm";
import { Players } from "@rbxts/services";
import { ClientBackpack, ClientBackpacks } from "../shared/networking";
import { ToolId } from "../shared/types";

/**
 * All client backpacks synced from the server. Maps player name to their backpack state (tools + equipped).
 * @hidden
 * @client
 */
export const _clientBackpacks = atom<ClientBackpacks>(new Map());

/**
 * The client's backpack state (derived from `_clientBackpacks`).
 * Contains backpack and equip.
 *
 * backpack: `ToolId` that the client owns
 * equip: `ToolId` of the currently equipped tool.
 * @client
 */
export const clientBackpack = computed(
	() => _clientBackpacks().get(Players.LocalPlayer?.Name) ?? ({ backpack: new Map(), equip: "" } as ClientBackpack),
);

/**
 * The hotbar slots of ToolId, "Drag", or "Empty" from 0 to 9.
 * Tools that fit in hotbar slots are stored here, while overflow tools go to `clientBackpackOrder`.
 * @client
 */
export const clientHotbar = atom(new Map<number, ToolId | "Drag" | "Empty">());

/**
 * Overflow tools that don't fit in hotbar slots.
 * Also tracks "Drag" placeholder for dragging.
 * @client
 */
export const clientBackpackOrder = atom<Array<ToolId>>([]);

/**
 * Contains the tool being dragged, mouse offset, source slot/location, and input object.
 * Undefined when not dragging.
 * @client
 */
export const draggingAtom = atom<
	| {
			id: ToolId;
			offset: Vector2;
			from: number | "Inventory";
			inputObject?: InputObject;
	  }
	| undefined
>(undefined);

/**
 * Whether the inventory is currently open.
 * You can update this to control state.
 * @client
 */
export const inventoryVisibleAtom = atom<boolean>(false);

/**
 * What the client is currently hovering over in the backpack.
 * @client
 */
export const backpackSelectionAtom = atom<number | "Inventory" | undefined>(undefined);

/**
 * Predicate function for filtering tools by their metadata.
 * @template T The shape of the metadata object.
 * @client
 */
export type BackpackFilterFn<T = Record<string, unknown>> = (metadata: T) => boolean;

/**
 * Map of registered filter functions, keyed by filter name.
 * Used to dynamically show/hide tools in the inventory grid based on metadata.
 * @client
 */
export const filterAtom = atom(new Map<string, BackpackFilterFn>());
