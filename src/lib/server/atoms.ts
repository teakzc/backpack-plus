import { atom } from "@rbxts/charm";
import { ClientBackpacks } from "../shared/networking";

/**
 * Atom that holds every single client's inventory.
 * @server
 */
export const clientBackpacks = atom<ClientBackpacks>(new Map());
