import React, { useRef, useState } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { backpackSelectionAtom, inventoryVisibleAtom } from "../../../atoms";
import { inventoryDecoratorsAtom } from "../../../decorating";
import { backpackSettingsAtom } from "../../../settings";
import InventoryScrollingFrame from "./scrolling";

/**
 * @hidden
 */
export default function Inventory() {
	const visibility = useAtom(inventoryVisibleAtom);
	const settings = useAtom(backpackSettingsAtom);

	const [query, setQuery] = useState("");

	const scrollRef = useRef<ScrollingFrame>();

	const decorators = useAtom(inventoryDecoratorsAtom);

	if (!visibility) return undefined;

	const { ICON_SIZE, ICON_BUFFER, INVENTORY_ROWS, INVENTORY_HEADER, SEARCH_BUFFER_PIXELS } = settings.dimensions;

	const slotStep = ICON_SIZE + ICON_BUFFER;
	const toolbarWidth = ICON_BUFFER + settings.slots * slotStep;
	const toolbarHeight = ICON_BUFFER + ICON_SIZE + ICON_BUFFER;
	const inventoryHeight = toolbarHeight * INVENTORY_ROWS + INVENTORY_HEADER;

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0)}
			Position={new UDim2(0.5, 0, 1, -toolbarHeight - inventoryHeight)}
			Size={new UDim2(0, toolbarWidth, 0, inventoryHeight)}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				Active={false}
				Event={{
					MouseEnter: () => {
						backpackSelectionAtom("Inventory");
					},
					MouseLeave: () => {
						backpackSelectionAtom(undefined);
					},
				}}
			/>

			<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} Active={false}>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, SEARCH_BUFFER_PIXELS)} />
				<uipadding PaddingTop={new UDim(0, SEARCH_BUFFER_PIXELS)} />

				<frame Size={UDim2.fromScale(1, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					{decorators.get("header")?.map((decorator, index) => (
						<React.Fragment key={`inventory-header-${index}`}>
							{decorator({
								setQuery,
								query,
							})}
						</React.Fragment>
					))}
				</frame>

				<InventoryScrollingFrame scrollRef={scrollRef} query={query} />

				{/**
				 * Why no <frame> wrapper? Because the key will always make it after the scrolling. And also automatic size wont work
				 */}
				{decorators.get("footer")?.map((decorator, index) => (
					<React.Fragment key={`inventory-footer-${index}`}>
						{decorator({
							setQuery,
							query,
						})}
					</React.Fragment>
				))}
			</frame>

			{decorators.get("absolute")?.map((decorator, index) => (
				<React.Fragment key={`inventory-absolute-${index}`}>
					{decorator({
						setQuery,
						query,
					})}
				</React.Fragment>
			))}
		</frame>
	);
}
