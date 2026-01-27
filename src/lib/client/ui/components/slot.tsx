import React, { useEffect, useRef, useState } from "@rbxts/react";
import { tool } from "../../../server";
import { usePx } from "../hooks/usePx";
import { useAtom } from "@rbxts/react-charm";
import { Frame } from "../core/frame";
import { Button } from "../core/button";
import { GuiService, TextService, UserInputService } from "@rbxts/services";
import { dragTool, INVENTORY_PROPERTIES } from "../../core";
import { TextLabel } from "../core/text";
import { Image } from "../core/image";
import { inventorySyncRemotes } from "../../../shared/networking";
import { draggingState, equippedState, inventorySelectionState, inventoryVisibilityState } from "../../atoms";
import { useMotion } from "@rbxts/pretty-react-hooks";

interface slotProps extends React.PropsWithChildren {
	layoutOrder: number;
	tool: tool | "drag" | "empty";
	index: number;
	disableIndex?: boolean;
}

export function Slot(props: slotProps) {
	const px = usePx();

	const equipped = useAtom(() => equippedState());
	const visibility = useAtom(() => inventoryVisibilityState());

	useAtom(() => draggingState());

	const [hover, setHover] = useState(false);
	const [down, setDown] = useState(false);

	const [tooltipSize, setTooltipSize] = useMotion(0);

	const tooltipText = useRef<TextLabel>();

	useEffect(() => {
		if (props.tool === "drag" || props.tool === "empty") return;
		if (!props.tool.tooltip) return;
		if (!tooltipText.current) return;

		const size = TextService.GetTextSize(
			props.tool.tooltip,
			tooltipText.current.TextSize,
			tooltipText.current.Font,
			new Vector2(1000, 1000),
		);

		if (hover) {
			setTooltipSize.spring(size.X + px(24), {
				tension: 200,
				friction: 25,
				mass: 0.25,
			});
		} else {
			setTooltipSize.spring(0, {
				tension: 150,
				frequency: 0.25,
				damping: 1,
			});
		}
	}, [hover]);

	return (
		<Frame
			active={false}
			layoutOrder={props.layoutOrder}
			size={UDim2.fromOffset(px(78), px(78))}
			backgroundTransparency={1}
			clipsDescendants={false}
		>
			{props.tool !== "drag" && props.tool !== "empty" ? (
				!props.disableIndex && props.tool.tooltip ? (
					<Frame
						position={UDim2.fromScale(0.5, -0.375)}
						size={tooltipSize.map((V) => new UDim2(0, V, 0.375, 0))}
						backgroundColor={Color3.fromRGB(44, 44, 44)}
					>
						<TextLabel
							ref={tooltipText}
							textScaled={false}
							textSize={px(16)}
							textWrapped={false}
							textTruncate={Enum.TextTruncate.SplitWord}
							size={new UDim2(1, px(-16), 0.9, 0)}
							text={props.tool.tooltip}
							strokeTransparency={1}
						/>
						<uicorner CornerRadius={new UDim(0, px(8))} />
					</Frame>
				) : undefined
			) : undefined}

			<Button
				active={false}
				backgroundTransparency={props.tool === "drag" ? 1 : 0.5}
				backgroundColor={
					down ? Color3.fromRGB(97, 97, 97) : hover ? Color3.fromRGB(33, 33, 33) : Color3.fromRGB(44, 44, 44)
				}
				onMouseDown={(rbx, x, y) => {
					setDown(true);

					const cleanup = UserInputService.InputChanged.Connect((input) => {
						if (
							input.UserInputType === Enum.UserInputType.MouseMovement ||
							input.UserInputType === Enum.UserInputType.Touch
						) {
							cleanup.Disconnect();

							if (visibility && props.tool !== "empty" && props.tool !== "drag") {
								// Store the click position relative to the button's top-left
								const buttonPos = rbx.AbsolutePosition.add(GuiService.GetGuiInset()[0]);
								const buttonSize = rbx.AbsoluteSize;
								const buttonCenter = new Vector2(
									buttonPos.X + buttonSize.X / 2,
									buttonPos.Y + buttonSize.Y / 2,
								);

								const mousePos = new Vector2(x, y);
								const mouseOffset = mousePos.sub(buttonCenter);

								dragTool(props.tool, mouseOffset);
							}
						}
					});

					const detectCancel = rbx.MouseButton1Up.Connect(() => {
						cleanup.Disconnect();
						detectCancel.Disconnect();
					});
				}}
				onMouseUp={() => {
					setDown(false);
				}}
				onMouseEnter={() => {
					setHover(true);

					if (!props.disableIndex) {
						inventorySelectionState(props.index);
					}
				}}
				onMouseLeave={() => {
					setHover(false);
					setDown(false);

					if (!props.disableIndex) {
						inventorySelectionState(undefined);
					}
				}}
				onClick={() => {
					if (props.tool !== "drag" && props.tool !== "empty")
						inventorySyncRemotes.equipTool.request(equipped?.id === props.tool.id ? undefined : props.tool);
				}}
			>
				<uicorner CornerRadius={new UDim(0, px(16))} />
				<uiaspectratioconstraint AspectRatio={1} />

				{props.tool !== "drag" && props.tool !== "empty" ? (
					equipped?.id === props.tool.id ? (
						<uistroke
							Color={Color3.fromHSV(1, 0, 1)}
							Thickness={px(2)}
							Transparency={0}
							BorderStrokePosition={Enum.BorderStrokePosition.Inner}
						/>
					) : undefined
				) : undefined}

				{props.tool !== "drag" && props.disableIndex !== true ? (
					<TextLabel
						active={false}
						size={UDim2.fromScale(0.25, 0.25)}
						position={UDim2.fromScale(0, 0)}
						anchorPoint={new Vector2(0, 0)}
						textScaled={false}
						textSize={px(16)}
						strokeTransparency={0.5}
						thickness={2}
						text={tostring(props.index + 1 === 10 ? 0 : props.index + 1)}
						zIndex={2}
						font={INVENTORY_PROPERTIES.INVENTORY_FONT}
					/>
				) : undefined}

				{props.tool !== "drag" && props.tool !== "empty" ? (
					props.tool.image !== undefined && props.tool.image !== "" ? (
						<Image
							active={false}
							size={UDim2.fromScale(0.9, 0.9)}
							backgroundTransparency={1}
							image={props.tool.image}
						/>
					) : props.tool.name !== undefined && props.tool.name !== "" ? (
						<TextLabel
							active={false}
							size={UDim2.fromScale(0.9, 0.5)}
							position={UDim2.fromScale(0.5, 0.5)}
							anchorPoint={new Vector2(0.5, 0.5)}
							textScaled={true}
							textWrapped={true}
							strokeTransparency={0.5}
							thickness={2}
							text={props.tool.name}
							zIndex={2}
							font={INVENTORY_PROPERTIES.INVENTORY_FONT}
						/>
					) : (
						<TextLabel
							active={false}
							size={UDim2.fromScale(0.9, 0.5)}
							position={UDim2.fromScale(0.5, 0.5)}
							anchorPoint={new Vector2(0.5, 0.5)}
							textScaled={true}
							textWrapped={true}
							strokeTransparency={0.5}
							thickness={2}
							text={`Tool: ${tostring(props.tool.id)}`}
							zIndex={2}
							font={INVENTORY_PROPERTIES.INVENTORY_FONT}
						/>
					)
				) : undefined}
			</Button>

			<uiaspectratioconstraint AspectRatio={1} />
		</Frame>
	);
}
