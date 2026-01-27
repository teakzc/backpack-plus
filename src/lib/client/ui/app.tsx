import React from "@rbxts/react";
import { Layer } from "./core/layer";
import { draggingState, inventoryVisibilityState } from "../atoms";
import { useAtom } from "@rbxts/react-charm";
import { Drag } from "./components/drag";
import { Toolbar } from "./components/toolbar";
import { Backpack } from "./components/backpack";
import { INVENTORY_PROPERTIES } from "../core";

export function App() {
	const visibility = useAtom(() => inventoryVisibilityState());
	useAtom(() => draggingState());

	return (
		<Layer>
			{/* Slots */}
			<Toolbar />

			{/* Backpack */}
			{visibility ? <Backpack /> : undefined}

			{/* Drag */}
			{visibility ? <Drag /> : undefined}

			<uiscale Scale={INVENTORY_PROPERTIES.MOBILE ? 2 : 1.1} />
		</Layer>
	);
}
