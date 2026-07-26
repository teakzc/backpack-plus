import React, { useBinding } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { useSpring } from "@rbxts/react-ripple";
import { ToolId, ToolPlus } from "../../../../shared/types";
import { backpackSelectionAtom, consoleSwapAtom, inventoryVisibleAtom } from "../../../atoms";
import { slotDecoratorsAtom } from "../../../decorating/slot";
import { backpackSettingsAtom } from "../../../settings";
import { equipTool, swapSlots } from "../../../tools";
import { useTags } from "../../hooks/useTags";
import BackpackSlotContent from "./content";
import { backpackSlotInputBegan } from "./input";
import BackpackSlotTooltip from "./tooltip";

/**
 * @hidden
 */
export interface BackpackSlotProps {
	data?: ToolPlus;
	id: ToolId | "Drag" | "Empty";
	equipped: boolean;
	layoutOrder: number;
	visibility: boolean;
	inventory?: boolean;
}

/**
 * @hidden
 */
export default function BackpackSlot(props: BackpackSlotProps) {
	const [hover, setHover] = useBinding(false);

	const slotFrameRef = useTags(["backpack-SlotFrame"]);
	const buttonTags = props.equipped
		? ["backpack-SlotButtonEquipped", "backpack-SlotButton"]
		: ["backpack-SlotButton"];
	// Hotbar slots get an extra tag so gamepad focus can find "slot 1" on open.
	if (!props.inventory) buttonTags.push("backpack-HotbarSlotButton");
	const slotButtonRef = useTags(buttonTags, [props.equipped, props.inventory]);

	const decorators = useAtom(slotDecoratorsAtom);
	const settings = useAtom(backpackSettingsAtom);
	const { ICON_SIZE } = settings.dimensions;

	const [scale, setScale] = useSpring(1);

	useAtom(() => {
		inventoryVisibleAtom();
		setHover(false);
	});

	if (props.id === "Drag")
		return (
			<frame
				LayoutOrder={props.layoutOrder}
				Size={UDim2.fromOffset(ICON_SIZE, ICON_SIZE)}
				BackgroundTransparency={1}
			/>
		);

	return (
		<frame
			ref={slotFrameRef}
			Size={UDim2.fromOffset(ICON_SIZE, ICON_SIZE)}
			BackgroundTransparency={1}
			ClipsDescendants={false}
			LayoutOrder={props.layoutOrder}
		>
			<imagebutton
				ref={slotButtonRef}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Image={props.data?.icon}
				BackgroundTransparency={0.5}
				SelectionOrder={props.layoutOrder}
				Event={{
					MouseEnter: () => {
						setHover(true);
						if (props.inventory) return;
						backpackSelectionAtom(props.layoutOrder);
					},
					MouseLeave: () => {
						setHover(false);
						if (props.inventory) return;
						// Only clear if we're still the selected slot: when the virtual
						// cursor slides between slots, the next slot's enter can fire before
						// this leave, and an unconditional clear would wipe that fresh value.
						if (backpackSelectionAtom() === props.layoutOrder) backpackSelectionAtom(undefined);
					},
					SelectionGained: () => {
						setHover(true);
						if (props.inventory) return;
						backpackSelectionAtom(props.layoutOrder);
					},
					SelectionLost: () => {
						setHover(false);
						if (props.inventory) return;
						if (backpackSelectionAtom() === props.layoutOrder) backpackSelectionAtom(undefined);
					},
					InputBegan: (rbx, input) => backpackSlotInputBegan(props, rbx, input),
					MouseButton1Click: () => {
						// Keyboard/touch: A-click equips directly.
						if (settings.inputType === "default") {
							equipTool(props.id);
							return;
						}

						// Gamepad (A button): first press picks up this slot as the swap
						// source; second press places/swaps onto this slot, then clears it.

						setScale.setGoal(1, { impulse: 4, tension: 240, friction: 19 });

						const held = consoleSwapAtom();
						if (held === undefined) {
							// Hotbar slots are picked by position (empty slots included);
							// inventory tools by id.
							if (props.inventory) {
								if (props.id !== "Empty" && props.id !== "Drag") consoleSwapAtom(props.id);
							} else {
								consoleSwapAtom(props.layoutOrder);
							}
						} else {
							// Target a specific inventory tool by id (so two inventory tools
							// swap), or a hotbar slot by position.
							if (props.inventory) {
								if (props.id !== "Empty" && props.id !== "Drag") swapSlots(held, props.id);
							} else {
								swapSlots(held, props.layoutOrder);
							}
							consoleSwapAtom(undefined);
						}
					},
				}}
			>
				<BackpackSlotContent
					visibility={props.visibility}
					layoutOrder={props.layoutOrder}
					icon={props.data?.icon}
					name={props.data?.name}
					inventory={props.inventory}
					id={props.id}
				/>

				{decorators.map((decorator, index) => (
					<React.Fragment key={`slot-decorator-${index}`}>
						{decorator(props.data, {
							location: props.layoutOrder,
							equipped: props.equipped,
							dragged: props.id === "Drag",
							hovered: hover,
						})}
					</React.Fragment>
				))}

				{props.data?.tooltip !== "" && props.data?.tooltip !== undefined ? (
					<BackpackSlotTooltip hover={hover} tooltip={props.data.tooltip} />
				) : undefined}

				<uiscale Scale={scale} />

				<uiaspectratioconstraint AspectRatio={1} />
			</imagebutton>
		</frame>
	);
}
