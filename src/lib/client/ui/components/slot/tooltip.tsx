import { useBindingListener } from "@rbxts/pretty-react-hooks";
import React, { useRef } from "@rbxts/react";
import { useSignalState } from "@rbxts/react-charm";
import { useSpring } from "@rbxts/react-ripple";
import { TextService } from "@rbxts/services";
import { getBackpackSettings } from "@/client/settings";

interface BackpackSlotTooltipProps {
	tooltip: string;
	hover: React.Binding<boolean>;
}

/**
 * @hidden
 */
export default function BackpackSlotTooltip(props: BackpackSlotTooltipProps) {
	const [tooltipSize, setTooltipSize] = useSpring(0);
	const tooltipRef = useRef<TextLabel>();

	const { ICON_SIZE } = useSignalState(() => getBackpackSettings().dimensions);

	useBindingListener(props.hover, (hover) => {
		if (!tooltipRef.current) return;

		const size = TextService.GetTextSize(
			props.tooltip,
			tooltipRef.current.TextSize,
			tooltipRef.current.Font,
			new Vector2(1000, 1000),
		);

		if (hover) {
			setTooltipSize.setGoal(size.X + 36, {
				tension: 200,
				friction: 25,
				mass: 0.25,
			});
		} else {
			setTooltipSize.setGoal(0, {
				tension: 30,
				dampingRatio: 1,
			});
		}
	});

	return (
		<frame
			Position={new UDim2(0.5, 0, 0, -ICON_SIZE * 0.15)}
			AnchorPoint={new Vector2(0.5, 1)}
			Size={tooltipSize.map((V) => new UDim2(0, V, 0, ICON_SIZE * 0.35))}
			ClipsDescendants={true}
		>
			<textlabel
				ref={tooltipRef}
				Size={new UDim2(1, -16, 1, -16)}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Text={props.tooltip}
			/>
		</frame>
	);
}
