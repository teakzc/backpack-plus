import React, { forwardRef } from "@rbxts/react";
import { Frame, FrameProps } from "./frame";
import { usePx } from "../hooks/usePx";

interface ScrollingProps extends FrameProps<ScrollingFrame> {
	automaticCanvasSize?: Enum.AutomaticSize | React.Binding<Enum.AutomaticSize>;
	bottomImage?: ContentId | React.Binding<ContentId>;
	midImage?: ContentId | React.Binding<ContentId>;
	scrollBarImageColor3?: Color3 | React.Binding<Color3>;
	scrollBarImageTransparency?: number | React.Binding<number>;
	scrollBarThickness?: number | React.Binding<number>;
	scrollingDirection?: Enum.ScrollingDirection | React.Binding<Enum.ScrollingDirection>;
	scrollingEnabled?: boolean | React.Binding<boolean>;
	topImage?: ContentId | React.Binding<ContentId>;
	verticalScrollBarInSet?: Enum.ScrollBarInset | React.Binding<Enum.ScrollBarInset>;
	verticalScrollBarPosition?: Enum.VerticalScrollBarPosition | React.Binding<Enum.VerticalScrollBarPosition>;
	canvasPosition?: Vector2 | React.Binding<Vector2>;
	canvasSize?: UDim2 | React.Binding<UDim2>;
	elasticBehavior?: Enum.ElasticBehavior | React.Binding<Enum.ElasticBehavior>;
	horizontalScrollBarInSet?: Enum.ScrollBarInset | React.Binding<Enum.ScrollBarInset>;
	disableInset?: boolean;
}

/**
 * Creates a scrolling frame
 *
 * @hidden
 */
export const Scrolling = forwardRef((props: ScrollingProps, ref: React.Ref<ScrollingFrame>) => {
	const px = usePx();

	return (
		<scrollingframe
			ref={ref}
			Size={props.size ?? UDim2.fromScale(1, 1)}
			Position={props.position ?? UDim2.fromScale(0.5, 0.5)}
			AnchorPoint={props.anchorPoint ?? new Vector2(0.5, 0.5)}
			Rotation={props.rotation}
			BackgroundColor3={props.backgroundColor}
			BackgroundTransparency={props.backgroundTransparency ?? 1}
			ClipsDescendants={props.clipsDescendants}
			Visible={props.visible}
			ZIndex={props.zIndex}
			LayoutOrder={props.layoutOrder}
			BorderSizePixel={0}
			Event={props.event}
			Change={props.change}
			AutomaticCanvasSize={props.automaticCanvasSize}
			BottomImage={props.bottomImage}
			MidImage={props.midImage}
			ScrollBarImageColor3={props.scrollBarImageColor3}
			ScrollBarImageTransparency={props.scrollBarImageTransparency}
			ScrollBarThickness={props.scrollBarThickness}
			ScrollingDirection={props.scrollingDirection}
			ScrollingEnabled={props.scrollingEnabled}
			TopImage={props.topImage}
			VerticalScrollBarInset={props.verticalScrollBarInSet}
			VerticalScrollBarPosition={props.verticalScrollBarPosition}
			CanvasPosition={props.canvasPosition}
			CanvasSize={props.canvasSize}
			ElasticBehavior={props.elasticBehavior}
			HorizontalScrollBarInset={props.horizontalScrollBarInSet}
		>
			{props.disableInset ? (
				props.children
			) : (
				<Frame backgroundTransparency={1} size={new UDim2(1, px(-35), 1, px(-35))}>
					{props.children}
				</Frame>
			)}
		</scrollingframe>
	);
});
