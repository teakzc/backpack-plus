import React from "@rbxts/react";
import { useSignalState } from "@rbxts/react-charm";
import { UserInputService } from "@rbxts/services";
import { getBackpackSettings } from "@/client/settings";
interface HintFrameProps {
	isConsole: boolean;
	text: string;
	img: string;
}

function HintFrame(props: HintFrameProps) {
	const imgSize = props.isConsole ? 60 : 30;
	const textSize = props.isConsole ? 32 : 19;

	return (
		<frame AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout
				Padding={new UDim(0, props.isConsole ? 20 : 12)}
				FillDirection={Enum.FillDirection.Horizontal}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>

			<imagelabel Size={UDim2.fromOffset(imgSize, imgSize)} Image={props.img} BackgroundTransparency={1} />

			<textlabel
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				TextSize={textSize}
				Text={props.text}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Center}
			>
				<uitextsizeconstraint MaxTextSize={textSize} />
			</textlabel>
		</frame>
	);
}

export default function InventoryConsoleHints() {
	const settings = useSignalState(getBackpackSettings);
	const { ICON_SIZE, ICON_BUFFER } = settings.dimensions;

	const width = ICON_BUFFER + settings.slots * (ICON_SIZE + ICON_BUFFER);
	return (
		<frame
			// Float just above the inventory frame (this is a child of it): bottom-center
			// anchored to the frame's top edge, lifted by one ICON_BUFFER gap.
			AnchorPoint={new Vector2(0.5, 1)}
			Position={new UDim2(0.5, 0, 0, -ICON_BUFFER)}
			Size={UDim2.fromOffset(width, settings.device === "console" ? 95 : 60)}
		>
			<uilistlayout
				Padding={new UDim(0, 25)}
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>

			<HintFrame
				isConsole={settings.device === "console"}
				img={UserInputService.GetImageForKeyCode(Enum.KeyCode.ButtonX)}
				text="Remove From Hotbar"
			/>
			<HintFrame
				isConsole={settings.device === "console"}
				img={UserInputService.GetImageForKeyCode(Enum.KeyCode.ButtonA)}
				text="Select/Swap"
			/>
			<HintFrame
				isConsole={settings.device === "console"}
				img={UserInputService.GetImageForKeyCode(Enum.KeyCode.ButtonB)}
				text="Close Backpack"
			/>
		</frame>
	);
}
