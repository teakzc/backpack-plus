import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { VRService } from "@rbxts/services";
import { ToolId } from "../../../shared/types";
import { FuzzyScoreSorting } from "../../../shared/utils/fuzzyscore";
import {
	backpackSelectionAtom,
	clientBackpack,
	clientBackpackOrder,
	clientHotbar,
	draggingAtom,
	inventoryVisibleAtom,
} from "../../atoms";
import { backpackSettings } from "../../settings";
import { BACKPACK_DIMENSIONS } from "../constants";
import { useTokens } from "../hooks";
import { Slot } from "./Slot";

export function Inventory() {
	const visibility = useAtom(inventoryVisibleAtom);
	const settings = useAtom(backpackSettings);
	const drag = useAtom(draggingAtom);

	const [query, setQuery] = useState("");

	const inventory = useAtom(() => {
		const backpack = clientBackpackOrder();
		const hotbar = clientHotbar();

		const hotbarIds = new Set<ToolId | "Drag" | "Empty">();
		for (const [_, id] of hotbar) {
			hotbarIds.add(id);
		}

		const filtered = backpack.filter((id) => !hotbarIds.has(id) || draggingAtom()?.id !== id);

		if (query === "") return filtered;

		const bp = clientBackpack().backpack;
		const names = filtered.map((id) => bp.get(id)?.name ?? id);
		return FuzzyScoreSorting(names, query, filtered)
			.filter(([score]) => score >= 0.3)
			.map(([_, id]) => id);
	}, [query]);

	const scrollRef = useRef<ScrollingFrame>();
	const textRef = useRef<TextBox>();

	useEventListener(textRef.current?.GetPropertyChangedSignal("Text"), () => {
		setQuery(textRef.current?.Text ?? "");
	});

	useEffect(() => {
		const frame = scrollRef.current;
		if (!frame) return;

		const { ICON_SIZE, ICON_BUFFER } = BACKPACK_DIMENSIONS;
		const countX = math.floor(frame.AbsoluteSize.X / (ICON_SIZE + ICON_BUFFER));
		const maxRow = math.ceil(inventory.size() / math.max(countX, 1));
		const canvasSizeY = maxRow * (ICON_SIZE + ICON_BUFFER) + ICON_BUFFER;

		frame.CanvasSize = UDim2.fromOffset(0, canvasSizeY);
	}, [inventory, visibility]);

	const tokens = useTokens();

	const IsVr = VRService.VREnabled;

	if (!visibility) return undefined;

	const {
		ICON_SIZE,
		ICON_BUFFER,
		INVENTORY_ROWS,
		INVENTORY_HEADER,
		INVENTORY_HEADER_SIZE,
		SEARCH_BUFFER_PIXELS,
		SEARCH_WIDTH_PIXELS,
		SEARCH_TEXT_OFFSET,
	} = BACKPACK_DIMENSIONS;

	const slotStep = ICON_SIZE + ICON_BUFFER;
	const toolbarWidth = ICON_BUFFER + settings.slots * slotStep;
	const toolbarHeight = ICON_BUFFER + ICON_SIZE + ICON_BUFFER;
	const inventoryHeight = toolbarHeight * INVENTORY_ROWS + INVENTORY_HEADER;
	const headerInner = INVENTORY_HEADER_SIZE - SEARCH_BUFFER_PIXELS * 2;

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
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} />

				<uipadding PaddingTop={new UDim(0, SEARCH_BUFFER_PIXELS)} />

				<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, headerInner)}>
					<uipadding
						PaddingRight={new UDim(0, SEARCH_BUFFER_PIXELS)}
						PaddingLeft={new UDim(0, SEARCH_BUFFER_PIXELS)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0, 0.5)}
						Position={UDim2.fromScale(0, 0.5)}
						Text={"backpack+"}
						TextSize={32}
						TextXAlignment={Enum.TextXAlignment.Left}
						Size={new UDim2(0, SEARCH_WIDTH_PIXELS - SEARCH_BUFFER_PIXELS * 2, 0, headerInner)}
					/>

					<frame
						AnchorPoint={new Vector2(1, 0.5)}
						Position={UDim2.fromScale(1, 0.5)}
						Size={new UDim2(0, SEARCH_WIDTH_PIXELS - SEARCH_BUFFER_PIXELS * 2, 0, headerInner)}
					>
						<uistroke />
						<uicorner CornerRadius={new UDim(0, 3)} />

						<textbox
							ref={textRef}
							AnchorPoint={new Vector2(0, 0.5)}
							PlaceholderText={"Search"}
							Text={""}
							TextXAlignment={Enum.TextXAlignment.Left}
							Position={new UDim2(0, SEARCH_TEXT_OFFSET, 0.5, 0)}
							Size={
								new UDim2(
									0,
									SEARCH_WIDTH_PIXELS - SEARCH_BUFFER_PIXELS * 2 - SEARCH_TEXT_OFFSET * 2 - 20,
									0,
									headerInner - SEARCH_TEXT_OFFSET * 2,
								)
							}
						></textbox>
					</frame>
				</frame>

				<frame Size={new UDim2(1, 0, 0, SEARCH_BUFFER_PIXELS)} BackgroundTransparency={1} />

				<scrollingframe
					ref={scrollRef}
					CanvasSize={new UDim2(0, 0, 0, 0)}
					Size={
						new UDim2(
							1,
							((tokens?.GetAttribute("ScrollingBarSize") as number) ?? 8) + 1,
							1,
							-INVENTORY_HEADER_SIZE - (IsVr ? 2 * BACKPACK_DIMENSIONS.INVENTORY_ARROWS_BUFFER_VR : 0),
						)
					}
				>
					<uiflexitem FlexMode={Enum.UIFlexMode.Fill} ItemLineAlignment={Enum.ItemLineAlignment.Center} />

					<frame
						Position={UDim2.fromOffset(ICON_BUFFER, 0)}
						Size={new UDim2(1, -ICON_BUFFER * 2, 1, 0)}
						BackgroundTransparency={1}
					>
						<uigridlayout
							SortOrder={Enum.SortOrder.LayoutOrder}
							CellSize={UDim2.fromOffset(ICON_SIZE, ICON_SIZE)}
							CellPadding={UDim2.fromOffset(ICON_BUFFER, ICON_BUFFER)}
						/>

						{inventory.map((id, index) => (
							<Slot
								visibility={visibility}
								inventory={true}
								key={`inventory-${id}`}
								layoutOrder={index}
								id={drag?.id === id ? "Drag" : id}
							/>
						))}
					</frame>
				</scrollingframe>
			</frame>
		</frame>
	);
}
