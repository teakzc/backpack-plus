import React from "@rbxts/react";
import { BACKPACK_DIMENSIONS } from "../../constants";

export default function InventoryContentDivider() {
	return <frame Size={new UDim2(1, 0, 0, BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS)} BackgroundTransparency={1} />;
}
