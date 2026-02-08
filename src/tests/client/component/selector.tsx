import React, { useEffect, useState } from "@rbxts/react";
import { add_filter, clear_filters } from "../../../lib";
import { getBindingValue, useMotion } from "@rbxts/pretty-react-hooks";
import { usePx } from "../../../lib/client/ui/hooks/usePx";
import { Button } from "./button";
import { TextLabel } from "../../../lib/client/ui/core/text";

export interface selectorButtonProps {
	color: Color3 | React.Binding<Color3>;
	text: string;
	fn: () => void;
}

export function SelectorButtons(props: selectorButtonProps) {
	const [H, S, V] = getBindingValue(props.color).ToHSV();

	const px = usePx();

	const [hovered, setHovered] = useState(false);
	const [pressed, setPressed] = useState(false);

	const [mainSize, setMainSize] = useMotion(1);

	useEffect(() => {
		if (pressed) {
			setMainSize.spring(0.8, { impulse: -0.0045, damping: 0.75, tension: 300 });
		} else if (hovered) {
			setMainSize.spring(1.2, { friction: 13, tension: 200, impulse: 0.003 });
		} else {
			setMainSize.spring(1, { damping: 0.4, tension: 500, velocity: -0.0004 });
		}
	}, [pressed, hovered]);

	return (
		<Button
			size={UDim2.fromOffset(px(190), px(80))}
			backgroundTransparency={0}
			backgroundColor={Color3.fromHSV(1, 0, 1)}
			onMouseEnter={() => {
				setHovered(true);
			}}
			onMouseLeave={() => {
				setHovered(false);
				setPressed(false);
			}}
			onMouseDown={() => {
				setPressed(true);
			}}
			onClick={() => {
				setPressed(false);
				props.fn();
				setMainSize.impulse(0.001);
			}}
		>
			<TextLabel strokeTransparency={0.5} size={UDim2.fromScale(0.9, 0.7)} text={props.text} />

			<uiscale Scale={mainSize} />

			<uistroke Thickness={px(6)} Color={Color3.fromHSV(0, 0, 1)}>
				<uigradient
					Rotation={-90}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromHSV(H, S, V * 0.4)),
							new ColorSequenceKeypoint(1, Color3.fromHSV((H - 0.02) % 1, S, V * 0.4)),
						])
					}
				></uigradient>
			</uistroke>

			<uigradient
				Rotation={-90}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, getBindingValue(props.color)),
						new ColorSequenceKeypoint(1, Color3.fromHSV((H - 0.08) % 1, S * 0.9, V)),
					])
				}
			></uigradient>

			<uicorner CornerRadius={new UDim(0, px(16))} />
		</Button>
	);
}

export function EXAMPLE_SELECTOR() {
	return (
		<frame
			AnchorPoint={new Vector2(1, 0.5)}
			Position={UDim2.fromScale(0, 0.5)}
			Size={UDim2.fromScale(0.35, 1)}
			BackgroundTransparency={1}
			BackgroundColor3={Color3.fromHSV(0, 0, 0.5)}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 16)}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>

			<SelectorButtons
				color={Color3.fromHSV(0.06, 0.71, 1)}
				text="Legendary"
				fn={() => {
					clear_filters();
					add_filter((tool) => tool.metadata.rarity === "legendary");
				}}
			/>

			<SelectorButtons
				color={Color3.fromHSV(0.73, 0.81, 1)}
				text="Epic"
				fn={() => {
					clear_filters();
					add_filter((tool) => tool.metadata.rarity === "epic");
				}}
			/>

			<SelectorButtons
				color={Color3.fromHSV(0.38, 0.43, 0.89)}
				text="Sword"
				fn={() => {
					clear_filters();
					add_filter((tool) => tool.metadata.type === "sword");
				}}
			/>

			<SelectorButtons
				color={Color3.fromHSV(0, 0, 1)}
				text="Clear"
				fn={() => {
					clear_filters();
				}}
			/>
		</frame>
	);
}
