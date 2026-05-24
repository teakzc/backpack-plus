import React from "@rbxts/react";
import { DraggingSlot } from "./components/DraggingSlot";
import { Hotbar } from "./components/Hotbar";
import { Inventory } from "./components/Inventory";

export function BackpackPlusApp() {
	return (
		<screengui IgnoreGuiInset={true} ResetOnSpawn={false}>
			<stylelink StyleSheet={script.Parent?.WaitForChild("base") as StyleSheet} />

			<Hotbar />
			<Inventory />
			<DraggingSlot />
		</screengui>
	);
}
