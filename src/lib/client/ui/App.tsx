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
					<frame
						Size={UDim2.fromScale(1, 1)}
						BackgroundTransparency={1}
						BorderSizePixel={0}
						SelectionGroup={true}
						SelectionBehaviorUp={Enum.SelectionBehavior.Stop}
						SelectionBehaviorDown={Enum.SelectionBehavior.Stop}
						SelectionBehaviorLeft={Enum.SelectionBehavior.Stop}
						SelectionBehaviorRight={Enum.SelectionBehavior.Stop}
					>
						<BackpackStyleProvider />
						<BackpackHotbar />
						<Inventory />
						<BackpackDraggingSlot />
					</frame>
				</screengui>
			</ErrorBoundary>
		</StrictMode>
	);
}
