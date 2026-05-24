import { atom, computed } from "@rbxts/charm";
import { Players } from "@rbxts/services";
import { ClientBackpack, ClientBackpacks } from "../shared/networking";
import { ToolId } from "../shared/types";

export const _clientBackpacks = atom<ClientBackpacks>(new Map());

export const clientBackpack = computed(
	() =>
		_clientBackpacks().get(Players.LocalPlayer?.Name) ??
		({ backpack: new Map(), equip: "" } as ClientBackpack),
);

export const clientHotbar = atom(new Map<number, ToolId | "Drag" | "Empty">());

export const clientBackpackOrder = atom<Array<ToolId>>([]);

export const draggingAtom = atom<
	| {
			id: ToolId;
			offset: Vector2;
			from: number | "Backpack";
	  }
	| undefined
>(undefined);

export const inventoryVisibleAtom = atom<boolean>(false);

export const backpackSelectionAtom = atom<number | "Inventory" | undefined>(undefined);
