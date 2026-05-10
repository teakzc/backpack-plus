import { set } from "@rbxts/sift/out/Dictionary";
import { ClientBackpack, ToolPlus } from "../shared/types";
import { clientBackpacks } from "./atoms";

/**
 * Registers a player's backpack data
 * @param client The player to register
 */
export function registerPlayer(client: Player) {
	clientBackpacks((current) => {
		return set(current, client.Name, new Map<string, ToolPlus>());
	});
}

/**
 * Unregisters a player's backpack data
 * @param client The player to unregister
 */
export function unregisterPlayer(client: Player) {
	clientBackpacks((current) => {
		return set(current, client.Name, undefined);
	});
}

/**
 * Modifies a player's backpack data
 * @param client The player to modify
 * @param callback The callback to modify the backpack
 */
export function modifyPlayer(client: Player, callback: (backpack: ClientBackpack) => ClientBackpack) {
	clientBackpacks((current) => {
		const clientBackpack = current.get(client.Name);

		if (!clientBackpack) {
			return current;
		}

		return set(current, client.Name, callback(clientBackpack));
	});
}
