import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { initializeBackpackClient } from "@/client/core";
import { BackpackPlusApp } from "@/client/ui/App";

initializeBackpackClient();

const root = createRoot(new Instance("Folder", Players.LocalPlayer.WaitForChild("PlayerGui")));
root.render(createPortal(<BackpackPlusApp />, Players.LocalPlayer.WaitForChild("PlayerGui")));
