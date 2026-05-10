import React from "@rbxts/react";
import { Toolbar } from "./components/Toolbar";

export function BackpackPlusApp() {
	return (
		<screengui>
			<stylelink StyleSheet={script.Parent?.WaitForChild("base") as StyleSheet} />
			<Toolbar />
		</screengui>
	);
}
