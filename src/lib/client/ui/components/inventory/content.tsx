import React from "@rbxts/react";
import { BACKPACK_DIMENSIONS } from "../../constants";

export default function InventoryContent(props: React.PropsWithChildren) {
	const { INVENTORY_HEADER_SIZE, SEARCH_BUFFER_PIXELS } = BACKPACK_DIMENSIONS;

	const headerInner = INVENTORY_HEADER_SIZE - SEARCH_BUFFER_PIXELS * 2;

	return (
		<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, headerInner)}>
			<uipadding
				PaddingRight={new UDim(0, SEARCH_BUFFER_PIXELS)}
				PaddingLeft={new UDim(0, SEARCH_BUFFER_PIXELS)}
			/>

			{props.children}
		</frame>
	);
}
