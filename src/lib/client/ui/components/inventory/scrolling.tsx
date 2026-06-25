import { getBindingValue } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { VRService } from "@rbxts/services";
import { ToolId } from "../../../../shared/types";
import { clientBackpack, clientBackpackOrder, clientHotbar, filterAtom, inventoryVisibleAtom } from "../../../atoms";
import { backpackSettingsAtom } from "../../../settings";
import { useTokens } from "../../hooks";
import BackpackSlot from "../slot/page";
import { filterInventory, fuzzyFilterInventory } from "./utils";

interface InventoryScrollingFrameProps {
	scrollRef: React.MutableRefObject<ScrollingFrame | undefined>;
	query: string | React.Binding<string>;
}

/**
 * @hidden
 */
export default function InventoryScrollingFrame(props: InventoryScrollingFrameProps) {
	const tokens = useTokens();
	const visibility = useAtom(inventoryVisibleAtom);
	const backpackData = useAtom(clientBackpack);
	const dimensions = useAtom(() => backpackSettingsAtom().dimensions);

	const { ICON_SIZE, ICON_BUFFER, INVENTORY_HEADER_SIZE } = dimensions;
	const IsVr = VRService.VREnabled;

	const inventory = useAtom(() => {
		const backpack = clientBackpackOrder();
		const hotbar = clientHotbar();

		const hotbarIds = new Set<ToolId | "Drag" | "Empty">();
		for (const [_, id] of hotbar) {
			hotbarIds.add(id);
		}

		const bp = backpackData.backpack;
		const filters = filterAtom();

		const filtered = filterInventory(backpack, hotbarIds, bp, filters);

		if (props.query === "") return filtered;

		return fuzzyFilterInventory(filtered, bp, getBindingValue(props.query));
	}, [props.query, backpackData]);

	useEffect(() => {
		const frame = props.scrollRef.current;
		if (!frame) return;

		const countX = math.floor(frame.AbsoluteSize.X / (ICON_SIZE + ICON_BUFFER));
		const maxRow = math.ceil(inventory.size() / math.max(countX, 1));
		const canvasSizeY = maxRow * (ICON_SIZE + ICON_BUFFER) + ICON_BUFFER;

		frame.CanvasSize = UDim2.fromOffset(0, canvasSizeY);
	}, [inventory, visibility, ICON_SIZE, ICON_BUFFER]);

	return (
		<scrollingframe
			ref={props.scrollRef}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			Size={
				new UDim2(
					1,
					((tokens?.GetAttribute("ScrollingBarSize") as number) ?? 8) + 1,
					1,
					-INVENTORY_HEADER_SIZE - (IsVr ? 2 * dimensions.INVENTORY_ARROWS_BUFFER_VR : 0),
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

				{inventory.map((id, index) => {
					const data = backpackData.backpack.get(id);

					return (
						<BackpackSlot
							visibility={visibility}
							inventory={true}
							key={`inventory-${id}`}
							layoutOrder={index}
							id={id}
							equipped={backpackData.equip === id}
							data={data}
						/>
					);
				})}
			</frame>
		</scrollingframe>
	);
}
