import React from "@rbxts/react";
import { IS_EDIT } from "../hooks/isedit";

interface LayerProps extends React.PropsWithChildren {
	displayOrder?: number;
	safeZoneBypass?: Enum.ScreenInsets;
}

export function Layer({ safeZoneBypass, displayOrder, children }: LayerProps) {
	return IS_EDIT ? (
		<frame
			BackgroundTransparency={1}
			Size={new UDim2(1, 0, 1, 0)}
			Position={new UDim2(0, 0, 0, 0)}
			ZIndex={displayOrder}
		>
			{children}
		</frame>
	) : (
		<screengui
			ScreenInsets={safeZoneBypass ?? Enum.ScreenInsets.CoreUISafeInsets}
			ResetOnSpawn={false}
			DisplayOrder={displayOrder}
			IgnoreGuiInset={true}
			ZIndexBehavior={"Sibling"}
		>
			{children}
		</screengui>
	);
}
