import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Frame } from "../core/frame";
import { usePx } from "../hooks/usePx";
import { TextLabel } from "../core/text";
import { TextBox } from "../core/textbox";
import { Scrolling } from "../core/scrolling";
import { Button } from "../core/button";
import { useAtom } from "@rbxts/react-charm";
import { backpackState, inventorySelectionState, inventoryVisibilityState } from "../../atoms";
import { Slot } from "./slot";
import { INVENTORY_PROPERTIES } from "../../core";
import { FuzzyScoreSorting } from "@rbxts/fuzzy-search/out/Sorting/FuzzyScoreSorting";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import { tool } from "../../../server";

function filterBackpack(text: string, backpack: (tool | "drag")[]) {
	const searchText = text;

	const filter = backpack.filter((V) => V !== "drag");

	if (searchText === "") {
		return filter;
	}

	const toolName = filter.map((tool) => tool.name ?? tool.tooltip ?? `Tool: ${tool.id}`);

	const sortedResults = FuzzyScoreSorting(toolName, searchText, filter);

	// Filter out poor matches (score threshold) and extract tools
	const SCORE_THRESHOLD = 0.3; // Adjust this value (0-1) - higher = stricter

	return sortedResults.filter(([score]) => score >= SCORE_THRESHOLD).map(([, tool]) => tool);
}

export function Backpack() {
	const px = usePx();

	const backpack = useAtom(() => backpackState());
	const visible = useAtom(() => inventoryVisibilityState());
	const [filter, setFilter] = useState<tool[]>(backpack.filter((V) => V !== "drag"));

	const search = useRef<TextBox>();

	useEffect(() => {
		setFilter(filterBackpack(search.current?.Text ?? "", backpack));
	}, [backpack]);

	useEventListener(search.current?.GetPropertyChangedSignal("Text"), () => {
		setFilter(filterBackpack(search.current?.Text ?? "", backpack));
	});

	const displayTools = search.current?.Text !== "" ? filter : backpack;

	return (
		<Frame
			anchorPoint={new Vector2(0.5, 1)}
			position={new UDim2(0.5, 0, 1, px(-90))}
			size={new UDim2(0, px(INVENTORY_PROPERTIES.MOBILE ? 511.2 : 852), 0, px(416))}
			backgroundTransparency={0.5}
		>
			<uicorner CornerRadius={new UDim(0, px(16))} />

			<Frame
				anchorPoint={new Vector2(0, 0)}
				position={new UDim2(0, px(6.5), 0, px(6.5))}
				size={UDim2.fromOffset(px(INVENTORY_PROPERTIES.MOBILE ? 240 : 400), px(45))}
				backgroundTransparency={1}
			>
				<TextLabel
					size={new UDim2(1, -px(8), 1, -px(8))}
					text={"Inventory"}
					textXAlignment={Enum.TextXAlignment.Left}
					textSize={px(38)}
					textScaled={false}
					thickness={px(3)}
					font={INVENTORY_PROPERTIES.INVENTORY_FONT}
				/>
			</Frame>

			<Frame
				anchorPoint={new Vector2(0, 0)}
				position={new UDim2(1, px(-253.73), 0, px(6.5))}
				size={UDim2.fromOffset(px(247), px(45))}
			>
				<uicorner CornerRadius={new UDim(0, px(8))} />
				<uistroke Transparency={0.7} Color={Color3.fromHSV(1, 0, 1)} Thickness={px(1)} />

				<TextBox
					ref={search}
					anchorPoint={new Vector2(0, 0.5)}
					size={UDim2.fromOffset(px(200), px(28))}
					position={new UDim2(0, px(10.4), 0.5, 0)}
					backgroundTransparency={1}
					textSize={px(40)}
					textScaled={false}
					thickness={px(2)}
					textTruncate={Enum.TextTruncate.AtEnd}
					textXAlignment={Enum.TextXAlignment.Left}
					placeHolderText={"Search..."}
					font={INVENTORY_PROPERTIES.INVENTORY_FONT}
				/>
			</Frame>

			<Scrolling
				anchorPoint={new Vector2(0, 0)}
				size={new UDim2(1, px(11.7), 1, px(-58))}
				position={UDim2.fromOffset(0, px(58))}
				disableInset={true}
				scrollBarThickness={4}
				zIndex={10}
			>
				<Frame
					anchorPoint={new Vector2(0, 0)}
					size={new UDim2(1, px(-13), 1, 0)}
					position={UDim2.fromOffset(px(6.5), 0)}
					backgroundTransparency={1}
				>
					<uigridlayout
						HorizontalAlignment={Enum.HorizontalAlignment.Left}
						VerticalAlignment={Enum.VerticalAlignment.Top}
						CellPadding={UDim2.fromOffset(px(6.5), px(6.5))}
						CellSize={UDim2.fromOffset(px(78), px(78))}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					{displayTools.map((tool, index) => {
						if (!visible || index === -1) return undefined;

						return <Slot disableIndex={true} layoutOrder={index} index={index} tool={tool} />;
					})}
				</Frame>

				<Button
					zIndex={-10}
					anchorPoint={new Vector2(0, 0)}
					size={new UDim2(1, px(-13), 1, 0)}
					position={UDim2.fromOffset(px(6.5), 0)}
					backgroundTransparency={1}
					onMouseEnter={() => {
						inventorySelectionState("backpack");
					}}
					onMouseLeave={() => {
						inventorySelectionState(undefined);
					}}
				/>
			</Scrolling>
		</Frame>
	);
}
