import { Players } from "@rbxts/services";
import { EXAMPLE_SELECTOR } from "./component/selector";
import React from "@rbxts/react";
import { initialize_backpack, initialize_inputs, mount_component, render_backpack, toggle_inventory } from "../../lib";
import { createRoot } from "@rbxts/react-roblox";
import { FPSBAR } from "./component/fps";

initialize_backpack({});

mount_component(<EXAMPLE_SELECTOR />, "inventory");
mount_component(<FPSBAR />, "toolbar");

const ui_container = new Instance("ScreenGui");
ui_container.Name = "backpack-plus";
ui_container.Parent = Players.LocalPlayer?.WaitForChild("PlayerGui");

const root = createRoot(ui_container);

render_backpack(root);
initialize_inputs();
