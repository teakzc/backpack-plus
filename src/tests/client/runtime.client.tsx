import React from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { backpackInputHelper, initializeBackpackClient } from "../../lib/client/core";
import { BackpackPlusApp } from "../../lib/client/ui/App";

initializeBackpackClient();

const ui_container = Players.LocalPlayer?.WaitForChild("PlayerGui");

const root = createRoot(ui_container);
root.render(<BackpackPlusApp />);

backpackInputHelper(true);
