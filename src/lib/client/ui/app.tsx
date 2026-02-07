import React from "@rbxts/react";
import { Layer } from "./core/layer";
import { draggingState, inventoryVisibilityState, mountedAtoms } from "../atoms";
import { useAtom } from "@rbxts/react-charm";
import { Drag } from "./components/drag";
import { Toolbar } from "./components/toolbar";
import { Backpack } from "./components/backpack";
import { ClickOff } from "./components/clickoff";

/**
 * The main App component for the inventory UI
 *
 * @hidden
 */
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

			{/* Mounted Components */}
			{mountedAtoms.base().map((component) => component)}

			{/* Detect if client clicked off */}
			{visibility ? <ClickOff /> : undefined}
		</Layer>
	);
}
