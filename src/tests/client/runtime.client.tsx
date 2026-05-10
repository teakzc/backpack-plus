import { Players } from "@rbxts/services";
import { initializeBackpackClient } from "../../lib/client/core";
import { createRoot } from "@rbxts/react-roblox";
import React from "@rbxts/react";
import { BackpackPlusApp } from "../../lib/client/ui/App";

initializeBackpackClient();

const ui_container = new Instance("ScreenGui");
ui_container.Name = "backpack-plus";
ui_container.Parent = Players.LocalPlayer?.WaitForChild("PlayerGui");

const root = createRoot(ui_container);
root.render(<BackpackPlusApp />);
