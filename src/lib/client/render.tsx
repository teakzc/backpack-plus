import { createPortal, createRoot, Root } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { App } from "./ui/app";
import React from "@rbxts/react";
import { inventoryVisibilityState } from "./atoms";
import { dropTool } from "./core";

/**
 * Renders the inventory
 *
 * @param root The `Instance` to call `createRoot` on
 * @param target PlayerGUI
 * @returns The `Root`
 */
export function renderInventory(
	root: Instance = new Instance("Folder"),
	target: Instance = Players.LocalPlayer.WaitForChild("PlayerGui"),
): Root {
	const createdRoot = createRoot(root);

	createdRoot.render(createPortal(<App />, target));

	return createdRoot;
}

/**
 * Toggle inventory full display
 *
 * @param state Whether to display the full backpack or not
 */
export function toggleInventory(state: boolean) {
	inventoryVisibilityState(state);

	if (!state) {
		dropTool();
	}
}
