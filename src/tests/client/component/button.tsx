import React from "@rbxts/react";

interface FrameProps<T extends Instance = Frame> extends React.PropsWithChildren {
	ref?: React.Ref<T>;
	event?: React.InstanceEvent<T>;
	change?: React.InstanceChangeEvent<T>;
	size?: UDim2 | React.Binding<UDim2>;
	position?: UDim2 | React.Binding<UDim2>;
	anchorPoint?: Vector2 | React.Binding<Vector2>;
	rotation?: number | React.Binding<number>;
	backgroundColor?: Color3 | React.Binding<Color3>;
	backgroundTransparency?: number | React.Binding<number>;
	clipsDescendants?: boolean | React.Binding<boolean>;
	visible?: boolean | React.Binding<boolean>;
	active?: boolean | React.Binding<boolean>;
	zIndex?: number | React.Binding<number>;
	layoutOrder?: number | React.Binding<number>;
	cornerRadius?: UDim | React.Binding<UDim>;
}

interface ButtonProps extends FrameProps<ImageButton> {
	active?: boolean | React.Binding<boolean>;
	interactable?: boolean | React.Binding<boolean>;
	onClick?: () => void;
	onMouseDown?: () => void;
	onMouseUp?: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	sfxtype?: "normal" | "dynamic";
}

export function Button(props: ButtonProps) {
	const { onClick, onMouseDown, onMouseEnter, onMouseLeave, onMouseUp, sfxtype = "normal" } = props;

	const event = {
		MouseButton1Click: () => {
			if (onClick) onClick();
		},
		MouseButton1Down: () => {
			if (onMouseDown) onMouseDown();
		},
		MouseButton1Up: onMouseUp,
		MouseEnter: () => {
			if (onMouseEnter) onMouseEnter();
		},
		MouseLeave: onMouseLeave,
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
}
