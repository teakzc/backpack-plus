import React from "@rbxts/react";
import { backpackSettings } from "../../settings";
import { BACKPACK_DIMENSIONS } from "../constants";

const { ICON_SIZE, ICON_BUFFER } = BACKPACK_DIMENSIONS;

export function Toolbar() {
	const slotStride = ICON_SIZE + ICON_BUFFER;
	const width = ICON_BUFFER + backpackSettings.slots * slotStride;
	const height = ICON_BUFFER + ICON_SIZE + ICON_BUFFER;

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 1)}
			Position={new UDim2(0.5, 0, 1, -height)}
			Size={new UDim2(0, width, 0, height)}
			BackgroundTransparency={0.5}
		/>
	);
}
