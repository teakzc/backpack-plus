import React, { useEffect, useRef, useState } from "@rbxts/react";
import { tool } from "../../../server";
import { useAtom } from "@rbxts/react-charm";
import { Frame } from "../core/frame";
import { Button } from "../core/button";
import { GuiService, Players, TextService, UserInputService } from "@rbxts/services";
import { drag_tool, BACKPACK_PROPERTIES, on_dropped } from "../../core";
import { TextLabel } from "../core/text";
import { Image } from "../core/image";
import { backpackSyncRemotes } from "../../../shared/networking";
import { draggingState, equippedState, backpackSelectionState, inventoryVisibilityState } from "../../atoms";
import { useMotion, useMouse } from "@rbxts/pretty-react-hooks";
import { BACKPACK_DIMENSIONS } from "../dimensions";
import { usePx } from "../hooks/usePx";

interface slotProps extends React.PropsWithChildren {
	layoutOrder: number;
	tool: tool | "drag" | "empty";
	index: number;
	disableIndex?: boolean;
}

/**
 * The tool slots
 *
 * @hidden
 */
export function Slot(props: slotProps) {
	const px = usePx();

	const equipped = useAtom(() => equippedState());
	const visibility = useAtom(() => inventoryVisibilityState());

	useAtom(() => draggingState());

	const [hover, setHover] = useState(false);
	const [down, setDown] = useState(false);

	const [tooltipSize, setTooltipSize] = useMotion(0);

	const tooltipText = useRef<TextLabel>();

	const mouse = useMouse();

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
			size={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_SIZE, BACKPACK_DIMENSIONS.ICON_SIZE)}
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

								drag_tool(props.tool, mouseOffset);

								const cleanupDropped = on_dropped(props.tool, () => {
									setDown(false);
									setHover(false);
									cleanupDropped();

									setTooltipSize.spring(0);
									setTooltipSize.set(0);

									Players.LocalPlayer.GetMouse().Icon =
										"rbxasset://textures/Cursors/KeyboardMouse/ArrowFarCursor.png";
								});
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
						backpackSelectionState(props.index);
					}

					Players.LocalPlayer.GetMouse().Icon = "rbxasset://textures/Cursors/KeyboardMouse/ArrowCursor.png";
				}}
				onMouseLeave={() => {
					setHover(false);
					setDown(false);

					if (!props.disableIndex) {
						backpackSelectionState(undefined);
					}
				}}
				onClick={() => {
					if (props.tool !== "drag" && props.tool !== "empty")
						backpackSyncRemotes.equipTool.request(equipped?.id === props.tool.id ? undefined : props.tool);
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
						size={UDim2.fromScale(0.3, 0.3)}
						position={UDim2.fromScale(0, 0)}
						anchorPoint={new Vector2(0, 0)}
						textScaled={false}
						textSize={16}
						strokeTransparency={0.5}
						thickness={px(2)}
						text={tostring(props.index + 1 === 10 ? 0 : props.index + 1)}
						zIndex={2}
						font={BACKPACK_PROPERTIES.BACKPACK_FONT}
					/>
				) : undefined}

				{props.tool !== "drag" && props.tool !== "empty" ? (
					props.tool.image !== undefined && props.tool.image !== undefined ? (
						<Image
							active={false}
							size={UDim2.fromScale(0.9, 0.9)}
							backgroundTransparency={1}
							image={props.tool.image}
						/>
					) : (
						<TextLabel
							active={false}
							position={UDim2.fromScale(0.5, 0.5)}
							anchorPoint={new Vector2(0.5, 0.5)}
							strokeTransparency={0.5}
							text={props.tool.name === undefined ? `Tool: ${props.tool.id}` : props.tool.name}
							zIndex={2}
							font={BACKPACK_PROPERTIES.BACKPACK_FONT}
							size={
								new UDim2(
									1,
									-BACKPACK_DIMENSIONS.SLOT_EQUIP_THICKNESS * 2,
									1,
									-BACKPACK_DIMENSIONS.SLOT_EQUIP_THICKNESS,
								)
							}
							textScaled={false}
							textSize={16}
							thickness={px(2)}
							textTruncate={Enum.TextTruncate.AtEnd}
							textWrapped={true}
						/>
					)
				) : undefined}
			</Button>

			<uiaspectratioconstraint AspectRatio={1} />
		</Frame>
	);
}
