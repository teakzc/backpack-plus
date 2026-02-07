import React from "@rbxts/react";

interface LayerProps extends React.PropsWithChildren {
	displayOrder?: number;
}

/**
 * Creates a layer
 *
 * @hidden
 */
export function Layer({ displayOrder, children }: LayerProps) {
	return (
		<screengui
			ResetOnSpawn={false}
			DisplayOrder={displayOrder}
			ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}
			IgnoreGuiInset={true}
			ZIndexBehavior={"Sibling"}
			ClipToDeviceSafeArea={false}
		>
			{children}
		</screengui>
	);
}
