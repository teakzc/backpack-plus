import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { backpackSettingsAtom } from "../../../settings";

interface BackpackPlusInventoryHeaderProps {
	text: string | React.Binding<string>;
}

export default function BackpackPlusInventoryHeader(props: BackpackPlusInventoryHeaderProps) {
	const { INVENTORY_HEADER_SIZE, SEARCH_BUFFER_PIXELS, SEARCH_WIDTH_PIXELS } = useAtom(
		() => backpackSettingsAtom().dimensions,
	);

	const headerInner = INVENTORY_HEADER_SIZE - SEARCH_BUFFER_PIXELS * 2;

	return (
		<textlabel
			AnchorPoint={new Vector2(0, 0.5)}
			Position={UDim2.fromScale(0, 0.5)}
			Text={props.text}
			TextSize={32}
			TextXAlignment={Enum.TextXAlignment.Left}
			Size={new UDim2(0, SEARCH_WIDTH_PIXELS - SEARCH_BUFFER_PIXELS * 2, 0, headerInner)}
		/>
	);
}
