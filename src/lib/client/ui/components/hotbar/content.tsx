import { getClientBackpack, getClientHotbar, getInventoryVisibility } from "@/client/charm";
import React from "@rbxts/react";
import { useSignalState } from "@rbxts/react-charm";
import { ToolId } from "@/shared/types";
import BackpackSlot from "@/client/ui/components/slot/page";

/**
 * @hidden
 */
export default function BackpackHotbarContent() {
	const visibility = useSignalState(getInventoryVisibility);
	const backpackData = useSignalState(getClientBackpack);

	const hotbar = useSignalState(() => {
		const hotbarMap = getClientHotbar();

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
				key={`slot-${slot}`}
				layoutOrder={slot}
				id={id}
				data={data}
				equipped={backpackData.equip === id}
			/>
		);
	});
}
