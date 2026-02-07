import React, { useEffect } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { draggingState } from "../../atoms";
import { usePx } from "../hooks/usePx";
import { useMotion, useMouse } from "@rbxts/pretty-react-hooks";
import { Layer } from "../core/layer";
import { Button } from "../core/button";
import { Frame } from "../core/frame";
import { TextLabel } from "../core/text";
import { Image } from "../core/image";
import { drop_tool, BACKPACK_PROPERTIES } from "../../core";
import { BACKPACK_DIMENSIONS } from "../dimensions";
import { GuiService, Players } from "@rbxts/services";

/**
 * The tool dragging component with smooth animations while keeping it not buggy by:
 * - One invisible frame that is locked to mouse
 * - Visual frame with springs
 *
 * @hidden
 */
export function Drag() {
	const px = usePx();

	const dragState = useAtom(() => draggingState());

	const mouse = useMouse((V) => {
		if (!dragState) return;
		const offset = dragState.offset; // Get the stored offset
		setPos.spring(UDim2.fromOffset(V.X - offset.X, V.Y - offset.Y), {
			tension: 150,
			friction: 15,
		});
	});

	useEffect(() => {
		if (!dragState) return;

		const mousePos = mouse.getValue();
		const value = UDim2.fromOffset(mousePos.X - dragState.offset.X, mousePos.Y - dragState.offset.Y);
		setPos.set(value);
		setPos.spring(value);

		setRot.spring(0, { tension: 200, friction: 5, mass: 0.5, impulse: 0.2 });
	}, [dragState]);

	const [pos, setPos] = useMotion(new UDim2());
	const [rot, setRot] = useMotion(0);

	if (!dragState) return;

	return (
		<Layer displayOrder={999}>
			<Button
				active={false}
				backgroundTransparency={0.5}
				position={mouse.map((V) => UDim2.fromOffset(V.X, V.Y))}
				size={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_SIZE, BACKPACK_DIMENSIONS.ICON_SIZE)}
				onMouseUp={() => {
					drop_tool();
				}}
			>
				<uiscale Scale={BACKPACK_PROPERTIES.MOBILE ? 1.8 : 1.1} />
			</Button>

			<Frame
				active={false}
				rotation={rot}
				position={pos}
				size={UDim2.fromOffset(BACKPACK_DIMENSIONS.ICON_SIZE, BACKPACK_DIMENSIONS.ICON_SIZE)}
				backgroundTransparency={1}
			>
				<Button active={false} backgroundTransparency={0.5} backgroundColor={Color3.fromHSV(0, 0, 0.4)}>
					<uicorner CornerRadius={new UDim(0, px(16))} />
					<uiaspectratioconstraint AspectRatio={1} />

					{dragState.from === "toolbar" ? (
						<TextLabel
							active={false}
							size={UDim2.fromScale(0.25, 0.25)}
							position={UDim2.fromScale(0, 0)}
							anchorPoint={new Vector2(0, 0)}
							textScaled={false}
							textSize={px(32)}
							strokeTransparency={0.5}
							thickness={px(2)}
							text={tostring(dragState.index + 1 === 10 ? 0 : dragState.index + 1)}
							zIndex={2}
							font={BACKPACK_PROPERTIES.BACKPACK_FONT}
						/>
					) : undefined}

					{dragState.tool.image !== undefined && dragState.tool.image !== "" ? (
						<Image
							active={false}
							size={UDim2.fromScale(0.9, 0.9)}
							backgroundTransparency={1}
							image={dragState.tool.image}
						/>
					) : dragState.tool.name !== undefined && dragState.tool.name !== "" ? (
						<TextLabel
							active={false}
							size={UDim2.fromScale(0.9, 0.5)}
							position={UDim2.fromScale(0.5, 0.5)}
							anchorPoint={new Vector2(0.5, 0.5)}
							textScaled={true}
							textWrapped={true}
							strokeTransparency={0.5}
							thickness={px(2)}
							text={dragState.tool.name}
							zIndex={2}
							font={BACKPACK_PROPERTIES.BACKPACK_FONT}
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
							thickness={px(2)}
							text={`Tool: ${tostring(dragState.tool.id)}`}
							zIndex={2}
							font={BACKPACK_PROPERTIES.BACKPACK_FONT}
						/>
					)}

					<Image
						active={false}
						size={UDim2.fromScale(0.9, 0.9)}
						backgroundTransparency={1}
						image={dragState.tool.image ?? ""}
					/>
				</Button>
				<uiaspectratioconstraint AspectRatio={1} />
			</Frame>
		</Layer>
	);
}
