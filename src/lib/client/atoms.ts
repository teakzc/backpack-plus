import { atom, computed } from "@rbxts/charm";
import { Players } from "@rbxts/services";
import { ClientBackpack, ClientBackpacks } from "../shared/networking";
import { ToolId } from "../shared/types";

export const _clientBackpacks = atom<ClientBackpacks>(new Map());

/**
 * Contains all tool ids
 */
export const clientBackpack = computed(
	() => _clientBackpacks().get(Players.LocalPlayer?.Name) ?? ({ backpack: new Map(), equip: "" } as ClientBackpack),
);

/**
 * Subset of clientBackpack, only tool ids in hotbar
 */
export const clientHotbar = atom(new Map<number, ToolId | "Drag" | "Empty">());

export const clientBackpackOrder = atom<Array<ToolId>>([]);

export const draggingAtom = atom<
	| {
			id: ToolId;
			offset: Vector2;
			from: number | "Backpack";
			inputObject?: InputObject;
	  }
	| undefined
>(undefined);

export const inventoryVisibleAtom = atom<boolean>(false);

export const backpackSelectionAtom = atom<number | "Inventory" | undefined>(undefined);

export type BackpackFilterFn<T = Record<string, unknown>> = (metadata: T) => boolean;

export const filterAtom = atom(new Map<string, BackpackFilterFn>());
