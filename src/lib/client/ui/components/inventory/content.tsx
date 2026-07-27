import React from "@rbxts/react";
import { useSignalState } from "@rbxts/react-charm";
import { getBackpackSettings } from "@/client/settings";

export default function BackpackPlusInventoryContent(props: React.PropsWithChildren) {
	const { INVENTORY_HEADER_SIZE, SEARCH_BUFFER_PIXELS } = useSignalState(() => getBackpackSettings().dimensions);

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
