import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { hotbarDecoratorsAtom } from "../../../decorating";
import { backpackSettingsAtom } from "../../../settings";
import { BACKPACK_DIMENSIONS } from "../../constants";
import BackpackHotbarContent from "./content";

/**
 * @hidden
 */
export default function BackpackHotbar() {
	const settings = useAtom(backpackSettingsAtom);

	const decorators = useAtom(hotbarDecoratorsAtom);

	const { ICON_SIZE, ICON_BUFFER } = BACKPACK_DIMENSIONS;
	const width = ICON_BUFFER + settings.slots * (ICON_SIZE + ICON_BUFFER);
	const height = ICON_BUFFER + ICON_SIZE + ICON_BUFFER;

	return (
		<frame
			AnchorPoint={new Vector2(0, 0)}
			Position={new UDim2(0.5, -width / 2, 1, -height)}
			Size={new UDim2(0, width, 0, height)}
			BackgroundTransparency={1}
			ZIndex={10}
		>
			<frame BackgroundTransparency={1} BorderSizePixel={0} Size={UDim2.fromScale(1, 1)}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0, ICON_BUFFER)}
				/>

				<BackpackHotbarContent />
			</frame>

			{decorators.map((decorator, index) => (
				<React.Fragment key={`hotbar-${index}`}>{decorator()}</React.Fragment>
			))}
		</frame>
	);
}
