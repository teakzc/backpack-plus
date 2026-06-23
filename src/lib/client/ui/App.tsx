import React, { StrictMode } from "@rbxts/react";
import BackpackHotbar from "./components/hotbar/page";
import Inventory from "./components/inventory/page";
import BackpackDraggingSlot from "./components/slot/draggingslot";
import BackpackStyleProvider from "./components/styleprovider";
import { ErrorBoundary } from "./error/errorboundary";

/**
 * The full backpack-plus client app to be rendered.
 * @client
 */
export function BackpackPlusApp() {
	return (
		<StrictMode>
			<ErrorBoundary>
				<screengui IgnoreGuiInset={true} ResetOnSpawn={false}>
					<BackpackStyleProvider />

					<BackpackHotbar />
					<Inventory />
					<BackpackDraggingSlot />
				</screengui>
			</ErrorBoundary>
		</StrictMode>
	);
}
