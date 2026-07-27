import React, { StrictMode } from "@rbxts/react";
import BackpackHotbar from "@/client/ui/components/hotbar/page";
import Inventory from "@/client/ui/components/inventory/page";
import BackpackDraggingSlot from "@/client/ui/components/slot/draggingslot";
import BackpackStyleProvider from "@/client/ui/components/styleprovider";
import { ErrorBoundary } from "@/client/ui/error/errorboundary";

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
