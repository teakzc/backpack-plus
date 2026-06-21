import React, { StrictMode } from "@rbxts/react";
import { registerSlotDecorator } from "../decorating";
import BackpackHotbar from "./components/hotbar/page";
import Inventory from "./components/inventory/page";
import BackpackDraggingSlot from "./components/slot/draggingslot";
import BackpackStyleProvider from "./components/styleprovider";

export function BackpackPlusApp() {
	return (
		<StrictMode>
			<screengui IgnoreGuiInset={true} ResetOnSpawn={false}>
				<BackpackStyleProvider />

				<BackpackHotbar />
				<Inventory />
				<BackpackDraggingSlot />
			</screengui>
		</StrictMode>
	);
}

registerSlotDecorator((toolData, ctx) => {
	return () => {
		const metadata = toolData?.metadata;
		if (!metadata) return;

		const quantity = metadata["quantity"];
		if (typeOf(quantity) !== "number") return;
	};
});
