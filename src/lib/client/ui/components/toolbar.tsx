import React from "@rbxts/react";
import { Frame } from "../core/frame";
import { usePx } from "../hooks/usePx";
import { Div } from "../core/divider";
import { draggingState, inventoryVisibilityState, toolbarState } from "../../atoms";
import { Slot } from "./slot";
import { useAtom } from "@rbxts/react-charm";

export function Toolbar() {
	const px = usePx();

	useAtom(() => inventoryVisibilityState());
	useAtom(() => draggingState());

	const toolbar = useAtom(() => toolbarState());

	return (
		<Frame
			anchorPoint={new Vector2(0.5, 1)}
			position={UDim2.fromScale(0.5, 1)}
			size={new UDim2(0, px(852), 0, px(90))}
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
		</Frame>
	);
}
