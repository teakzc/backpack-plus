import { useMouse } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { useSpring } from "@rbxts/react-ripple";
import { clientBackpack, draggingAtom } from "../../../atoms";
import { draggingSlotDecoratorsAtom } from "../../../decorating/draggingslot";
import { backpackSettingsAtom } from "../../../settings";
import { useTokens } from "../../hooks/useStyle";
import { useTags } from "../../hooks/useTags";
import BackpackSlotContent from "./content";

/**
 * @hidden
 */
export default function BackpackDraggingSlot() {
	const [pos, setPos] = useSpring(new UDim2());

	const mouse = useMouse((V) => {
		if (!drag) return;
		const offset = drag.offset; // Get the stored offset

		setPos.setGoal(UDim2.fromOffset(V.X - offset.X, V.Y - offset.Y), {
			tension: 150,
			friction: 15,
		});
	});

	const drag = useAtom(() => {
		const dragData = draggingAtom();

		if (dragData) {
			const mousePos = mouse.getValue();
			const value = UDim2.fromOffset(mousePos.X - dragData?.offset.X, mousePos.Y - dragData.offset.Y);

			setPos.setPosition(value);
			setPos.setGoal(value);
		}

		return dragData;
	});

	const data = useAtom(() => {
		return clientBackpack().backpack.get(drag?.id ?? "");
	}, [drag]);

	const equipped = useAtom(() => clientBackpack().equip === drag?.id, [drag]);

	const dragRef = useTags(equipped ? ["backpack-SlotButtonEquipped"] : [], [equipped]);

	const style = useTokens()?.GetAttribute("LightColor");

	const decorators = useAtom(draggingSlotDecoratorsAtom);
	const { ICON_SIZE } = useAtom(() => backpackSettingsAtom().dimensions);

	if (!drag) return;
	if (!data) return;

	return (
		<imagebutton
			Active={false}
			Position={pos}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Size={UDim2.fromOffset(ICON_SIZE, ICON_SIZE)}
			Transparency={0.5}
			Image={data.icon}
			Selectable={false}
			ref={dragRef}
			BackgroundColor3={typeIs(style, "Color3") ? style : undefined}
		>
			<BackpackSlotContent
				visibility={true}
				layoutOrder={drag.from !== "Inventory" ? drag.from : -1}
				icon={data.icon}
				name={data.name}
				id={drag.id}
			/>

			{decorators.map((decorator, index) => (
				<React.Fragment key={`slot-decorator-${index}`}>
					{decorator(data, {
						from: drag.from,
						equipped: equipped,
					})}
				</React.Fragment>
			))}
		</imagebutton>
	);
}
