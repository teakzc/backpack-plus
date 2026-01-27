import { atom, computed } from "@rbxts/charm";
import { tool } from "../server";
import { equippedRegistry } from "../shared/networking";
import { Players } from "@rbxts/services";

export const inventoryVisibilityState = atom<boolean>(false);

export const toolbarState = atom<(tool | "empty" | "drag")[]>([]); // Inside the toolbar
export const backpackState = atom<(tool | "drag")[]>([]); // Inside the full inventory
export const draggingState = atom<{
	tool: tool;
	from: "toolbar" | "backpack";
	offset: Vector2;
	index: number;
}>();

export const inventorySelectionState = atom<number | "backpack" | undefined>();

export const equippedState = computed(() => equippedRegistry()[Players.LocalPlayer.Name]);
