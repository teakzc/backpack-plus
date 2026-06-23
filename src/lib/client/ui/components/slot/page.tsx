import React, { useBinding } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { ToolId, ToolPlus } from "../../../../shared/types";
import { backpackSelectionAtom, inventoryVisibleAtom } from "../../../atoms";
import { slotDecoratorsAtom } from "../../../decorating";
import { equipTool } from "../../../tools";
import { BACKPACK_DIMENSIONS } from "../../constants";
import { useTags } from "../../hooks";
import BackpackSlotContent from "./content";
import { backpackSlotInputBegan } from "./input";
import BackpackSlotTooltip from "./tooltip";

/**
 * @hidden
 */
export interface BackpackSlotProps {
	data?: ToolPlus;
	id: ToolId | "Drag" | "Empty";
	equipped: boolean;
	layoutOrder: number;
	visibility: boolean;
	inventory?: boolean;
}

/**
 * @hidden
 */
export default function BackpackSlot(props: BackpackSlotProps) {
	const [hover, setHover] = useBinding(false);

	const slotFrameRef = useTags(["backpack-SlotFrame"]);
	const slotButtonRef = useTags(
		props.equipped ? ["backpack-SlotButtonEquipped", "backpack-SlotButton"] : ["backpack-SlotButton"],
		[props.equipped],
	);

	const decorators = useAtom(slotDecoratorsAtom);

	useAtom(() => {
		inventoryVisibleAtom();
		setHover(false);
	});

	if (props.id === "Drag")
		return (
			<frame
				LayoutOrder={props.layoutOrder}
				Size={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_SIZE, BACKPACK_DIMENSIONS.ICON_SIZE)}
				BackgroundTransparency={1}
			/>
		);

	return (
		<frame
			ref={slotFrameRef}
			Size={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_SIZE, BACKPACK_DIMENSIONS.ICON_SIZE)}
			BackgroundTransparency={1}
			ClipsDescendants={false}
			LayoutOrder={props.layoutOrder}
		>
			<imagebutton
				ref={slotButtonRef}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Image={props.data?.icon}
				BackgroundTransparency={0.5}
				Event={{
					MouseEnter: () => {
						setHover(true);
						if (props.inventory) return;
						backpackSelectionAtom(props.layoutOrder);
					},
					MouseLeave: () => {
						setHover(false);
						if (props.inventory) return;
						backpackSelectionAtom(undefined);
					},
					InputBegan: (rbx, input) => backpackSlotInputBegan(props, rbx, input),
					MouseButton1Click: () => {
						equipTool(props.id);
					},
				}}
			>
				<BackpackSlotContent
					visibility={props.visibility}
					layoutOrder={props.layoutOrder}
					icon={props.data?.icon}
					name={props.data?.name}
					inventory={props.inventory}
					id={props.id}
				/>

				{decorators.map((decorator, index) => (
					<React.Fragment key={`slot-decorator-${index}`}>
						{decorator(props.data, {
							location: props.layoutOrder,
							equipped: props.equipped,
							dragged: props.id === "Drag",
							hovered: hover,
						})}
					</React.Fragment>
				))}

				{props.data?.tooltip !== "" && props.data?.tooltip !== undefined ? (
					<BackpackSlotTooltip hover={hover} tooltip={props.data.tooltip} />
				) : undefined}

				<uiaspectratioconstraint AspectRatio={1} />
			</imagebutton>
		</frame>
	);
}
