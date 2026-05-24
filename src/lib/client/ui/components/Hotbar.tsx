import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { ToolId } from "../../../shared/types";
import { clientHotbar, inventoryVisibleAtom } from "../../atoms";
import { backpackSettings } from "../../settings";
import { BACKPACK_DIMENSIONS } from "../constants";
import { Slot } from "./Slot";

export function Hotbar() {
	const settings = useAtom(backpackSettings);
	const visibility = useAtom(inventoryVisibleAtom);

	const hotbar = useAtom(() => {
		const hotbarMap = clientHotbar();

		const arr: [number, ToolId | "Drag" | "Empty"][] = [];
		hotbarMap.forEach((tool, slot) => {
			arr.push([slot, tool ?? "Empty"]);
		});

		return arr;
	});

	const { ICON_SIZE, ICON_BUFFER } = BACKPACK_DIMENSIONS;
	const width = ICON_BUFFER + settings.slots * (ICON_SIZE + ICON_BUFFER);
	const height = ICON_BUFFER + ICON_SIZE + ICON_BUFFER;

	return (
		<frame
			AnchorPoint={new Vector2(0, 0)}
			Position={new UDim2(0.5, -width / 2, 1, -height)}
			Size={new UDim2(0, width, 0, height)}
			BackgroundTransparency={1}
		>
			{hotbar.map(([slot, id]) => {
				if (id === "Empty" && !visibility) return undefined;

				return <Slot visibility={visibility} key={`${slot}-${id}`} layoutOrder={slot} id={id} />;
			})}

			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, ICON_BUFFER)}
			/>
		</frame>
	);
}
