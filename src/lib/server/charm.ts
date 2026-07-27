import { signal } from "@rbxts/charm";
import { ClientBackpacks } from "@/shared/types";
/**
 * Atom that holds every single client's inventory.
 * @server
 */
export const [getClientBackpacks, setClientBackpacks] = signal<ClientBackpacks>(new Map());
