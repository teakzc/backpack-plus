import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { backpackSelectionAtom, consoleSwapAtom, inventoryVisibleAtom } from "../../../atoms";
import { inventoryDecoratorsAtom } from "../../../decorating/inventory";
import { clearBackpackSelection, focusFirstHotbarSlot } from "../../../inputs/gamepad";
import { backpackSettingsAtom } from "../../../settings";
import InventoryConsoleHints from "./consolehints";
import InventoryScrollingFrame from "./scrolling";

/**
 * Hides the engine's default gamepad selection glow on its parent button by
 * assigning an invisible label as the SelectionImageObject. The button stays
 * selectable — it just gets no outline visual when focused.
 * @hidden
 */
function HideSelectionOutline() {
	const ref = useRef<ImageLabel>();

	useEffect(() => {
		const label = ref.current;
		const button = label?.Parent;
		if (!label || !button || !button.IsA("GuiObject")) return;

		button.SelectionImageObject = label;
		return () => {
			if (button.SelectionImageObject === label) button.SelectionImageObject = undefined;
		};
	}, []);

	return <imagelabel ref={ref} BackgroundTransparency={1} />;
}

/**
 * @hidden
 */
export default function Inventory() {
	const visibility = useAtom(inventoryVisibleAtom);
	const settings = useAtom(backpackSettingsAtom);

	const [query, setQuery] = useState("");

	const scrollRef = useRef<ScrollingFrame>();

	const decorators = useAtom(inventoryDecoratorsAtom);

	// On gamepad, drop focus onto the first hotbar slot when the inventory opens
	// and clear it on close — satchel's enable/disableGamepadInventoryControl.
	useEffect(() => {
		if (!visibility || settings.inputType !== "gamepad") return;

		focusFirstHotbarSlot();

		return () => {
			clearBackpackSelection();
			// Drop any in-progress A-button pickup so it can't complete a
			// forgotten swap the next time the inventory opens.
			consoleSwapAtom(undefined);
		};
	}, [visibility, settings.inputType]);

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
			{settings.inputType === "gamepad" ? <InventoryConsoleHints /> : undefined}

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
			>
				<HideSelectionOutline />
			</imagebutton>

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
