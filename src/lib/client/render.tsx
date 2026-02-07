import { Root } from "@rbxts/react-roblox";
import React from "@rbxts/react";
import { mountedAtoms } from "./atoms";
import { BACKPACK_PROPERTIES, toggle_inventory } from "./core";
import { App } from "./ui/app";
import { Icon } from "@rbxts/topbar-plus";

/**
 * Renders the inventory
 *
 * @param root The `Root` to render the backpack on
 */
export function render_backpack(root: Root) {
	root.render(<App />);

	const inventoryToggleIcon = new Icon()
		.setName("Inventory")
		.setImage("rbxasset://textures/ui/TopBar/inventoryOn.png", "Selected")
		.setImage("rbxasset://textures/ui/TopBar/inventoryOff.png", "Deselected")
		.setOrder(-1)
		.setCaption("Toggle Inventory")
		.setImageScale(1)
		.toggled.Connect(() => {
			toggle_inventory();
		});
}

/**
 * Mounts a `React.JSX.Element` to the inventory UI
 *
 * @param component The component to mount
 * @param location The location to mount the component to
 */
export function mount_component(component: React.JSX.Element, location: keyof typeof mountedAtoms) {
	mountedAtoms[location]((current) => [...current, component]);
}

/**
 * Unmounts the `React.JSX.Element` from the inventory UI
 *
 * @param component The component to unmount
 * @param location The location to unmount the component from
 */
export function unmount_component(component: React.JSX.Element, location: keyof typeof mountedAtoms) {
	mountedAtoms[location]((current) => current.filter((c) => c !== component));
}
