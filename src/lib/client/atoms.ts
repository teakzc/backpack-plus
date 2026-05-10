import { atom, computed } from "@rbxts/charm";
import { ClientBackpack, ClientBackpacks, ToolId } from "../shared/types";
import { Players } from "@rbxts/services";

export const _clientBackpacks = atom<ClientBackpacks>(new Map());

export const clientBackpack = computed(
	() => _clientBackpacks().get(Players.LocalPlayer?.Name) ?? (new Map() as ClientBackpack),
);

export const clientHotbar = atom<Map<number, ToolId | "Drag" | undefined>>(new Map());

export const draggingAtom = atom<ToolId | undefined>(undefined);

export const inventoryVisibleAtom = atom<boolean>(false);
