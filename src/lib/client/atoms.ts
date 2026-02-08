import { atom, computed, subscribe } from "@rbxts/charm";
import { tool } from "../server";
import { equippedRegistry } from "../shared/networking";
import { Players } from "@rbxts/services";

/**
 * True when inventory is visible
 */
export const inventoryVisibilityState = atom<boolean>(false);

/**
 * @hidden
 */
export const toolbarState = atom<(tool | "empty" | "drag")[]>([]); // Inside the toolbar

/**
 * @hidden
 */
export const inventoryState = atom<(tool | "drag")[]>([]); // Inside the full inventory

/**
 * @hidden
 */
export const draggingState = atom<{
	tool: tool;
	from: "toolbar" | "backpack";
	offset: Vector2;
	index: number;
}>();

/**
 * When true it means the client is within the backpack
 *
 * @hidden
 */
export const clickOffState = atom<boolean>(false);

/**
 * What the client is currently selecting
 */
export const backpackSelectionState = atom<number | "backpack" | undefined>();

/**
 * The `tool` the client is equipping
 */
export const equippedState = computed(() => equippedRegistry()[Players.LocalPlayer?.Name ?? "MOCK_CLIENT"]);

/**
 * List of atoms that store components to be mounted
 */
export const mountedAtoms = {
	base: atom<React.JSX.Element[]>([]),
	inventory: atom<React.JSX.Element[]>([]),
	toolbar: atom<React.JSX.Element[]>([]),
};

type filter = (tool: tool) => boolean;

/**
 * Inventory filter
 */
export const filterList = atom<Array<filter>>([]);
