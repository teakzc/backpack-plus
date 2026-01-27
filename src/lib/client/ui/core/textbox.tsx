import React, { forwardRef } from "@rbxts/react";
import { FrameProps } from "./frame";
import { usePx } from "../hooks/usePx";

export interface TextBoxProps extends FrameProps<TextBox> {
	text?: string | React.Binding<string>;
	textColor3?: Color3 | React.Binding<Color3>;
	textDirection?: Enum.TextDirection | React.Binding<Enum.TextDirection>;
	textScaled?: boolean | React.Binding<boolean>;
	textSize?: number | React.Binding<number>;
	textTransparency?: number | React.Binding<number>;
	textWrapped?: boolean | React.Binding<boolean>;
	textXAlignment?: Enum.TextXAlignment | React.Binding<Enum.TextXAlignment>;
	textYAlignment?: Enum.TextYAlignment | React.Binding<Enum.TextYAlignment>;
	textTruncate?: Enum.TextTruncate | React.Binding<Enum.TextTruncate>;
	lineHeight?: number | React.Binding<number>;
	font?: Font;
	thickness?: number | React.Binding<number>;
	strokeTransparency?: number | React.Binding<number>;
	richText?: boolean | React.Binding<boolean>;
	placeHolderText?: string | React.Binding<string>;
}

export const TextBox = forwardRef<TextBox, TextBoxProps>((props, ref) => {
	const px = usePx();

	return (
		<textbox
			PlaceholderText={props.placeHolderText ?? ""}
			Size={props.size ?? UDim2.fromScale(1, 1)}
			Position={props.position ?? UDim2.fromScale(0.5, 0.5)}
			AnchorPoint={props.anchorPoint ?? new Vector2(0.5, 0.5)}
			BackgroundColor3={props.backgroundColor}
			BackgroundTransparency={props.backgroundTransparency ?? 1}
			ClipsDescendants={props.clipsDescendants}
			Visible={props.visible}
			ZIndex={props.zIndex}
			LayoutOrder={props.layoutOrder}
			BorderSizePixel={0}
			Text={props.text ?? ""}
			TextColor3={props.textColor3 ?? Color3.fromRGB(255, 255, 255)}
			TextDirection={props.textDirection}
			TextScaled={props.textScaled ?? true}
			TextSize={props.textSize}
			TextTransparency={props.textTransparency ?? 0}
			TextWrapped={props.textWrapped ?? true}
			TextXAlignment={props.textXAlignment}
			TextYAlignment={props.textYAlignment}
			ref={ref}
			FontFace={props.font}
			TextTruncate={props.textTruncate}
			LineHeight={props.lineHeight}
			RichText={props.richText}
		>
			{props.children}
			<uistroke Transparency={props.strokeTransparency ?? 0} Thickness={props.thickness ?? px(4)} />
		</textbox>
	);
});
