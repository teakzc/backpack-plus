import React, { forwardRef } from "@rbxts/react";
import { FrameProps } from "./frame";

export interface ButtonProps extends FrameProps<ImageButton> {
	active?: boolean | React.Binding<boolean>;
	interactable?: boolean | React.Binding<boolean>;
	onClick?: () => void;
	onMouseDown?: (rbx: ImageButton, x: number, y: number) => void;
	onMouseUp?: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

export const Button = forwardRef((props: ButtonProps) => {
	const { onClick, onMouseDown, onMouseEnter, onMouseLeave, onMouseUp } = props;

	const event = {
		MouseButton1Click: () => {
			if (onClick) onClick();
		},
		MouseButton1Down: (rbx: ImageButton, x: number, y: number) => {
			if (onMouseDown) onMouseDown(rbx, x, y);
		},
		MouseButton1Up: () => {
			if (onMouseUp) onMouseUp();
		},
		MouseEnter: () => {
			if (onMouseEnter) onMouseEnter();
		},
		MouseLeave: () => {
			if (onMouseLeave) onMouseLeave();
		},
	};
	return (
		<imagebutton
			Interactable={props.interactable ?? true}
			Active={props.active}
			AutoButtonColor={false}
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
			Event={event}
			Change={props.change}
		>
			{props.children}
			{props.cornerRadius && <uicorner CornerRadius={props.cornerRadius} />}
		</imagebutton>
	);
});
