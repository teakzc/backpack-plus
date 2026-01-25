import React from "@rbxts/react";
import { Layer } from "./core/layer";
import { usePx } from "./hooks/usePx";
import { Frame } from "./core/frame";
import { Div } from "./core/divider";

export function App() {
	const px = usePx();

	return (
		<Layer>
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
					{/* {SlotAtom.map((tool, index) => {
						// Since map starts at index 1, add 1 to get the actual atom key (2, 3, 4...)
						const actualIndex = index + 1;

						if ((tool === "empty" && !InventoryState) || index === -1) return undefined;

						return <Slot layoutOrder={index} index={actualIndex} tool={tool} />;
					})} */}
				</Div>
			</Frame>
		</Layer>
	);
}
