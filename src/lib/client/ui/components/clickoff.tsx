import React from "@rbxts/react";
import { BACKPACK_DIMENSIONS } from "../dimensions";
import { BACKPACK_PROPERTIES } from "../../core";
import { clickOffState } from "../../atoms";
import { Frame } from "../core/frame";

export function ClickOff() {
	const toolbarWidth =
		BACKPACK_DIMENSIONS.ICON_BUFFER +
		BACKPACK_PROPERTIES.TOOLBAR_AMOUNT * (BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER);

	const toolbarHeight =
		BACKPACK_DIMENSIONS.ICON_BUFFER + BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER;
	const backpackHeight = toolbarHeight * BACKPACK_DIMENSIONS.INVENTORY_ROWS() + BACKPACK_DIMENSIONS.INVENTORY_HEADER;

	return (
		<Frame
			size={UDim2.fromOffset(toolbarWidth, toolbarHeight + backpackHeight)}
			position={UDim2.fromScale(0.5, 1)}
			anchorPoint={new Vector2(0.5, 1)}
			backgroundTransparency={1}
			event={{
				MouseEnter: () => {
					clickOffState(true);
				},
				MouseLeave: () => {
					clickOffState(false);
				},
			}}
		/>
	);
}
