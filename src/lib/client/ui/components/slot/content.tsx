import React from "@rbxts/react";
import { useSignalState } from "@rbxts/react-charm";
import { getBackpackSettings } from "@/client/settings";
import { useTags } from "@/client/ui/hooks/useTags";

interface BackpackSlotContentProps {
	visibility: boolean;
	layoutOrder: number;
	inventory?: boolean;
	icon?: string;
	name?: string;
	id: string;
}

/**
 * @hidden
 */
export default function BackpackSlotContent(props: BackpackSlotContentProps) {
	const slotRef = useTags(["backpack-WeightBold", "backpack-SlotNumber"]);
	const textRef = useTags(["backpack-SlotName"]);

	const settings = useSignalState(getBackpackSettings);

	const { SLOT_EQUIP_THICKNESS } = settings.dimensions;

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} BorderSizePixel={0}>
			{props.inventory !== true && settings.inputType !== "gamepad" ? (
				<textlabel
					ref={slotRef}
					Size={UDim2.fromScale(0.4, 0.4)}
					Position={UDim2.fromScale(0, 0)}
					AnchorPoint={new Vector2(0, 0)}
					Text={tostring(props.layoutOrder === -1 ? "" : props.layoutOrder === 10 ? 0 : props.layoutOrder)}
					ZIndex={2}
				/>
			) : undefined}

			{props.id !== "Empty" && !props?.icon ? (
				<textlabel
					ref={textRef}
					Position={UDim2.fromScale(0.5, 0.5)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Size={new UDim2(1, -SLOT_EQUIP_THICKNESS * 2, 1, -SLOT_EQUIP_THICKNESS * 2)}
					Text={props?.name || props.id}
				/>
			) : undefined}
		</frame>
	);
}
