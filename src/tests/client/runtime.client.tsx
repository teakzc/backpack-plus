import { Players } from "@rbxts/services";
import React from "@rbxts/react";
import {
	initialize_backpack,
	initialize_inputs,
	inventoryVisibilityState,
	mount_component,
	render_backpack,
	toggle_inventory,
} from "../../lib";
import { createRoot } from "@rbxts/react-roblox";
import { Icon } from "@rbxts/topbarplus";
import { subscribe } from "@rbxts/charm";
import { EXAMPLE_SELECTOR } from "./component/selector";

initialize_backpack({});

mount_component(<EXAMPLE_SELECTOR />, "inventory");

const ui_container = new Instance("ScreenGui");
ui_container.Name = "backpack-plus";
ui_container.Parent = Players.LocalPlayer?.WaitForChild("PlayerGui");

const root = createRoot(ui_container);

render_backpack(root);
initialize_inputs();

const icon = new Icon()
	.setName("Inventory")
	.setImage("rbxasset://textures/ui/TopBar/inventoryOn.png", "Selected")
	.setImage("rbxasset://textures/ui/TopBar/inventoryOff.png", "Deselected")
	.setOrder(-1)
	.setCaption("Toggle Inventory")
	.bindToggleKey(Enum.KeyCode.Backquote)
	.setImageScale(1);

let is_syncing = false;

icon.toggled.Connect(() => {
	if (is_syncing) return;
	toggle_inventory();
});

subscribe(inventoryVisibilityState, (visible) => {
	is_syncing = true;
	if (visible) {
		icon.select();
	} else {
		icon.deselect();
	}
	is_syncing = false;
});
