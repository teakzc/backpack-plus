import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { ToolId } from "../../../../shared/types";
import { clientBackpack, clientHotbar, inventoryVisibleAtom } from "../../../atoms";
import BackpackSlot from "../slot/page";

export default function BackpackHotbarContent() {
	const visibility = useAtom(inventoryVisibleAtom);
	const backpackData = useAtom(clientBackpack);

	const hotbar = useAtom(() => {
		const hotbarMap = clientHotbar();

		const arr: [number, ToolId | "Drag" | "Empty"][] = [];
		hotbarMap.forEach((tool, slot) => {
			arr.push([slot, tool ?? "Empty"]);
		});

		return arr;
	});

	return hotbar.map(([slot, id]) => {
		if (id === "Empty" && !visibility) return undefined;

		const data = backpackData.backpack.get(id);

		return (
			<BackpackSlot
				visibility={visibility}
				key={`${slot}-${id}`}
				layoutOrder={slot}
				id={id}
				data={data}
				equipped={backpackData.equip === id}
			/>
		);
	});
}
