import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { GuiService, UserInputService } from "@rbxts/services";

import { ToolId } from "../../../shared/types";
import { backpackSelectionAtom, clientBackpack } from "../../atoms";
import { dragTool, equipTool } from "../../tools";
import { BACKPACK_DIMENSIONS } from "../constants";
import { useTags } from "../hooks";

interface SlotProps {
	id: ToolId | "Drag" | "Empty";
	layoutOrder: number;
	visibility: boolean;
	inventory?: boolean;
}

interface SlotContentProps {
	visibility: boolean;
	layoutOrder: number;
	inventory?: boolean;
	icon?: string;
	name?: string;
	id: string;
}

export function SlotContent(props: SlotContentProps) {
	const slotRef = useTags(["backpack-WeightBold", "backpack-SlotNumber"]);
	const textRef = useTags(["backpack-SlotName"]);

	return (
		<>
			{props.inventory !== true && props.visibility ? (
				<textlabel
					ref={slotRef}
					Size={UDim2.fromScale(0.4, 0.4)}
					Position={UDim2.fromScale(0, 0)}
					AnchorPoint={new Vector2(0, 0)}
					Text={tostring(props.layoutOrder === -1 ? "" : props.layoutOrder === 10 ? 0 : props.layoutOrder)}
					ZIndex={2}
				/>
			) : undefined}

			{props.id !== "Empty" && !props?.icon ? (
				<textlabel
					ref={textRef}
					Position={UDim2.fromScale(0.5, 0.5)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Size={
						new UDim2(
							1,
							-BACKPACK_DIMENSIONS.SLOT_EQUIP_THICKNESS * 2,
							1,
							-BACKPACK_DIMENSIONS.SLOT_EQUIP_THICKNESS * 2,
						)
					}
					Text={props?.name || props.id}
				/>
			) : undefined}
		</>
	);
}

export function Slot(props: SlotProps) {
	if (props.id === "Drag")
		return (
			<frame
				LayoutOrder={props.layoutOrder}
				Size={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_SIZE, BACKPACK_DIMENSIONS.ICON_SIZE)}
				BackgroundTransparency={1}
			/>
		);

	const toolData = useAtom(() => clientBackpack().backpack.get(props.id));
	const equipped = useAtom(() => clientBackpack().equip === props.id);

	const slotFrameRef = useTags(["backpack-SlotFrame"]);
	const slotButtonRef = useTags(
		equipped ? ["backpack-SlotButtonEquipped", "backpack-SlotButton"] : ["backpack-SlotButton"],
		[equipped],
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
				Image={toolData?.icon}
				BackgroundTransparency={0.5}
				Event={{
					MouseEnter: () => {
						if (props.inventory) return;
						backpackSelectionAtom(props.layoutOrder);
					},
					MouseLeave: () => {
						if (props.inventory) return;
						backpackSelectionAtom(undefined);
					},
					MouseButton1Down: (rbx, x, y) => {
						if (props.id === "Empty" || props.id === "Drag" || !props.visibility) return;

						let flag = false;

						const cleanupUIS = UserInputService.InputChanged.Connect((input) => {
							if (
								input.UserInputType === Enum.UserInputType.MouseMovement ||
								input.UserInputType === Enum.UserInputType.Touch
							) {
								if (flag) return;

								flag = true;
								cleanup(true);
							}
						});

						const cleanupDetect = rbx.MouseButton1Up.Connect(() => {
							if (flag) return;

							flag = true;
							cleanup(false);
						});

						const cleanup = (state: boolean) => {
							cleanupUIS.Disconnect();
							cleanupDetect.Disconnect();

							if (!state) return;

							const buttonPos = rbx.AbsolutePosition.sub(
								GuiService.GetInsetArea(Enum.ScreenInsets.None).Min,
							);

							const buttonSize = rbx.AbsoluteSize;

							const buttonCenter = new Vector2(
								buttonPos.X + buttonSize.X / 2,
								buttonPos.Y + buttonSize.Y / 2,
							);

							const mousePos = new Vector2(x, y);
							const mouseOffset = mousePos.sub(buttonCenter);

							dragTool(props.id, mouseOffset);
						};
					},
					MouseButton1Click: () => {
						equipTool(props.id);
					},
				}}
			>
				<SlotContent
					visibility={props.visibility}
					layoutOrder={props.layoutOrder}
					icon={toolData?.icon}
					name={toolData?.name}
					inventory={props.inventory}
					id={props.id}
				/>

				<uiaspectratioconstraint AspectRatio={1} />
			</imagebutton>
		</frame>
	);
}
