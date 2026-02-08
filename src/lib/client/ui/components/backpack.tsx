import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Frame } from "../core/frame";
import { TextLabel } from "../core/text";
import { TextBox } from "../core/textbox";
import { Scrolling } from "../core/scrolling";
import { useAtom } from "@rbxts/react-charm";
import {
	inventoryState,
	filterList,
	backpackSelectionState,
	inventoryVisibilityState,
	mountedAtoms,
} from "../../atoms";
import { Slot } from "./slot";
import { BACKPACK_PROPERTIES } from "../../core";
import { FuzzyScoreSorting } from "@rbxts/fuzzy-search/out/Sorting/FuzzyScoreSorting";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import { tool } from "../../../server";
import { BACKPACK_DIMENSIONS } from "../dimensions";
import { usePx } from "../hooks/usePx";

function applyFinalSorting(tools: tool[]) {
	let tool = tools;
	filterList().forEach((filter) => {
		tool = tool.filter((V) => filter(V));
	});
	return tool;
}

function filterBackpack(text: string, backpack: (tool | "drag")[]) {
	const searchText = text;

	const filter = backpack.filter((V) => V !== "drag");

	let sort = filter;

	if (searchText !== "") {
		const toolName = filter.map((tool) => tool.name ?? tool.tooltip ?? `Tool: ${tool.id}`);

		const sortedResults = FuzzyScoreSorting(toolName, searchText, filter);

		sort = sortedResults.filter(([score]) => score >= BACKPACK_PROPERTIES.SCORE_THRESHOLD).map(([, tool]) => tool);
	}

	return applyFinalSorting(sort);
}

/**
 * Thank you to https://github.com/ryanlua/satchel
 *
 * Code taken from ryanlua/satchel includes:
 * - calculation for dimensions
 *
 * Everything else is my own
 */

/**
 * Creates the backpack
 *
 * @hidden
 */
export function Backpack() {
	const px = usePx();

	const backpack = useAtom(() => inventoryState());
	const text = useAtom(() => BACKPACK_PROPERTIES.BACKPACK_TEXT());
	const visible = useAtom(() => inventoryVisibilityState());
	const [filter, setFilter] = useState<tool[]>(backpack.filter((V) => V !== "drag"));

	const filterListAtom = useAtom(() => filterList());

	const search = useRef<TextBox>();
	const grid = useRef<UIGridLayout>();

	useEffect(() => {
		setFilter(filterBackpack(search.current?.Text ?? "", backpack));
	}, [backpack, filterListAtom]);

	useEventListener(search.current?.GetPropertyChangedSignal("Text"), () => {
		setFilter(filterBackpack(search.current?.Text ?? "", backpack));
	});

	const toolbarWidth =
		BACKPACK_DIMENSIONS.ICON_BUFFER +
		BACKPACK_PROPERTIES.TOOLBAR_AMOUNT * (BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER);

	const toolbarHeight =
		BACKPACK_DIMENSIONS.ICON_BUFFER + BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER;
	const inventoryHeight = toolbarHeight * BACKPACK_DIMENSIONS.INVENTORY_ROWS() + BACKPACK_DIMENSIONS.INVENTORY_HEADER;

	return (
		<Frame
			anchorPoint={new Vector2(0.5, 0)}
			position={new UDim2(0.5, 0, 1, -toolbarHeight - inventoryHeight)}
			size={new UDim2(0, toolbarWidth, 0, inventoryHeight)}
			backgroundTransparency={0.5}
		>
			<uicorner CornerRadius={new UDim(0, px(16))} />

			{mountedAtoms.inventory().map((component) => component)}

			<Frame
				anchorPoint={new Vector2(0, 0)}
				position={
					new UDim2(0, BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS, 0, BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS)
				}
				size={UDim2.fromOffset(
					BACKPACK_DIMENSIONS.SEARCH_WIDTH_PIXELS - BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS * 2,
					BACKPACK_DIMENSIONS.INVENTORY_HEADER_SIZE - BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS * 2,
				)}
				backgroundTransparency={1}
			>
				<TextLabel
					size={new UDim2(1, -px(8), 1, -px(8))}
					text={text}
					textXAlignment={Enum.TextXAlignment.Left}
					textSize={px(50)}
					textScaled={false}
					thickness={px(3)}
					font={BACKPACK_PROPERTIES.BACKPACK_FONT}
				/>
			</Frame>

			<Frame
				anchorPoint={new Vector2(0, 0)}
				position={
					new UDim2(
						1,
						-(BACKPACK_DIMENSIONS.SEARCH_WIDTH_PIXELS - BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS * 2) -
							BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS,

						0,
						BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS,
					)
				}
				size={UDim2.fromOffset(
					BACKPACK_DIMENSIONS.SEARCH_WIDTH_PIXELS - BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS * 2,
					BACKPACK_DIMENSIONS.INVENTORY_HEADER_SIZE - BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS * 2,
				)}
			>
				<uicorner CornerRadius={new UDim(0, px(8))} />
				<uistroke Transparency={0.7} Color={Color3.fromHSV(1, 0, 1)} Thickness={px(1)} />

				<TextBox
					ref={search}
					anchorPoint={new Vector2(0, 0.5)}
					size={UDim2.fromOffset(
						BACKPACK_DIMENSIONS.SEARCH_WIDTH_PIXELS -
							BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS * 2 -
							BACKPACK_DIMENSIONS.SEARCH_TEXT_OFFSET * 2 -
							20,
						BACKPACK_DIMENSIONS.INVENTORY_HEADER_SIZE -
							BACKPACK_DIMENSIONS.SEARCH_BUFFER_PIXELS * 2 -
							BACKPACK_DIMENSIONS.SEARCH_TEXT_OFFSET * 2,
					)}
					position={new UDim2(0, BACKPACK_DIMENSIONS.SEARCH_TEXT_OFFSET, 0.5, 0)}
					backgroundTransparency={1}
					textSize={px(40)}
					textScaled={false}
					thickness={px(2)}
					textTruncate={Enum.TextTruncate.AtEnd}
					textXAlignment={Enum.TextXAlignment.Left}
					placeHolderText={"Search..."}
					font={BACKPACK_PROPERTIES.BACKPACK_FONT}
				/>
			</Frame>

			<Scrolling
				anchorPoint={new Vector2(0, 0)}
				size={new UDim2(1, 4 + 1, 1, -BACKPACK_DIMENSIONS.INVENTORY_HEADER)}
				position={UDim2.fromOffset(0, BACKPACK_DIMENSIONS.INVENTORY_HEADER)}
				disableInset={true}
				scrollBarThickness={px(4)}
				zIndex={10}
				canvasSize={UDim2.fromOffset(
					0,
					(grid.current?.AbsoluteCellCount.Y ?? 0) *
						(BACKPACK_DIMENSIONS.ICON_SIZE + BACKPACK_DIMENSIONS.ICON_BUFFER) +
						BACKPACK_DIMENSIONS.INVENTORY_HEADER,
				)}
			>
				<Frame
					anchorPoint={new Vector2(0, 0)}
					size={new UDim2(1, -(2 * BACKPACK_DIMENSIONS.ICON_BUFFER), 1, 0)}
					position={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_BUFFER, 0)}
					backgroundTransparency={1}
				>
					<uigridlayout
						ref={grid}
						HorizontalAlignment={Enum.HorizontalAlignment.Left}
						VerticalAlignment={Enum.VerticalAlignment.Top}
						CellPadding={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_BUFFER, BACKPACK_DIMENSIONS.ICON_BUFFER)}
						CellSize={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_SIZE, BACKPACK_DIMENSIONS.ICON_SIZE)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					{filter.map((tool, index) => {
						if (!visible || index === -1) return undefined;

						return <Slot disableIndex={true} layoutOrder={index} index={index} tool={tool} />;
					})}
				</Frame>

				<Frame
					zIndex={-10}
					anchorPoint={new Vector2(0, 0)}
					size={new UDim2(1, -(2 * BACKPACK_DIMENSIONS.ICON_BUFFER), 1, 0)}
					position={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_BUFFER, 0)}
					backgroundTransparency={1}
					event={{
						MouseEnter: () => {
							backpackSelectionState("backpack");
						},
						MouseLeave: () => {
							backpackSelectionState(undefined);
						},
					}}
				/>
			</Scrolling>
		</Frame>
	);
}
