import React from "@rbxts/react";
import { Frame } from "../core/frame";
import { Div } from "../core/divider";
import { draggingState, inventoryVisibilityState, mountedAtoms, toolbarState } from "../../atoms";
import { Slot } from "./slot";
import { useAtom } from "@rbxts/react-charm";
import { BACKPACK_DIMENSIONS } from "../dimensions";
import { BACKPACK_PROPERTIES } from "../../core";
import { usePx } from "../hooks/usePx";

/**
 * Thank you to https://github.com/ryanlua/satchel for the calculations for the toolbar,
 *
 * Thank you! thank you! thank you!
 */

/**
 * Creates the toolbar
 *
 * @hidden
 */
export function Toolbar() {
	const px = usePx();

	useAtom(() => inventoryVisibilityState());
	useAtom(() => draggingState());

	const toolbar = useAtom(() => toolbarState());

	return (
		<Frame
			anchorPoint={new Vector2(0, 0)}
			position={
				new UDim2(
					0.5,
					-(
						BACKPACK_DIMENSIONS.ICON_BUFFER +
						BACKPACK_PROPERTIES.TOOLBAR_AMOUNT *
							(BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER)
					) / 2,
					1,
					-(
						BACKPACK_DIMENSIONS.ICON_BUFFER +
						BACKPACK_DIMENSIONS.ICON_SIZE +
						BACKPACK_DIMENSIONS.ICON_BUFFER
					),
				)
			}
			size={
				new UDim2(
					0,
					BACKPACK_DIMENSIONS.ICON_BUFFER +
						BACKPACK_PROPERTIES.TOOLBAR_AMOUNT *
							(BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER),
					0,
					BACKPACK_DIMENSIONS.ICON_BUFFER + BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER,
				)
			}
			backgroundTransparency={1}
		>
			<Div
				sortOrder={Enum.SortOrder.LayoutOrder}
				padding={new UDim(0, px(6.5))}
				fillDirection={Enum.FillDirection.Horizontal}
			>
				{toolbar.map((tool, index) => {
					if ((tool === "empty" && !inventoryVisibilityState()) || index === -1) return undefined;

					return <Slot layoutOrder={index} index={index} tool={tool} />;
				})}
			</Div>

			{mountedAtoms.toolbar().map((component) => component)}
		</Frame>
	);
}
