import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { backpackInputHelper, initializeBackpackClient } from "../../lib/client/core";
import { BackpackPlusApp } from "../../lib/client/ui/App";

initializeBackpackClient();

const root = createRoot(new Instance("Folder", Players.LocalPlayer.WaitForChild("PlayerGui")));
root.render(createPortal(<BackpackPlusApp />, Players.LocalPlayer.WaitForChild("PlayerGui")));

backpackInputHelper(true);

