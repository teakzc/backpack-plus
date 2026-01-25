import React from "@rbxts/react";
import { Frame } from "./frame";
import { usePx } from "../hooks/usePx";

declare interface vDivProps extends React.PropsWithChildren {
	backgroundTransparency?: number | React.Binding<number>;
	size?: UDim2 | React.Binding<UDim2>;
	anchorPoint?: Vector2 | React.Binding<Vector2>;
	position?: UDim2 | React.Binding<UDim2>;
	fillDirection: Enum.FillDirection | React.Binding<Enum.FillDirection>;
	horizontalAlignment?: Enum.HorizontalAlignment | React.Binding<Enum.HorizontalAlignment>;
	horizontalFlex?: Enum.UIFlexAlignment | React.Binding<Enum.UIFlexAlignment>;
	verticalAlignment?: Enum.VerticalAlignment | React.Binding<Enum.VerticalAlignment>;
	verticalFlex?: Enum.UIFlexAlignment | React.Binding<Enum.UIFlexAlignment>;
	wraps?: boolean | React.Binding<boolean>;
	padding?: UDim | React.Binding<UDim>;
	clipsDescendants?: boolean | React.Binding<boolean>;
	sortOrder?: Enum.SortOrder | React.Binding<Enum.SortOrder>;
}

export function Div(props: vDivProps) {
	const px = usePx();

	return (
		<Frame
			position={props.position ?? UDim2.fromScale(0.5, 0.5)}
			size={props.size ?? UDim2.fromScale(1, 1)}
			backgroundTransparency={props.backgroundTransparency ?? 1}
			anchorPoint={props.anchorPoint ?? new Vector2(0.5, 0.5)}
			clipsDescendants={props.clipsDescendants}
		>
			{props.children}

			<uilistlayout
				HorizontalAlignment={props.horizontalAlignment ?? Enum.HorizontalAlignment.Center}
				HorizontalFlex={props.horizontalFlex ?? Enum.UIFlexAlignment.None}
				VerticalAlignment={props.verticalAlignment ?? Enum.VerticalAlignment.Center}
				VerticalFlex={props.verticalFlex ?? Enum.UIFlexAlignment.None}
				FillDirection={props.fillDirection}
				SortOrder={props.sortOrder ?? Enum.SortOrder.LayoutOrder}
				Wraps={props.wraps ?? false}
				Padding={props.padding ?? new UDim(0, px(8))}
			/>
		</Frame>
	);
}
