import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps, Number } from "@rbxts/ui-labs";
import { setClientBackpack } from "@/client";
import BackpackSlot from "@/client/ui/components/slot/page";
import BackpackStyleProvider from "@/client/ui/components/styleprovider";

const controls = {
	stack: Number(1, 0, 64, 1),
};

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls: controls,
	story: (props: InferProps<typeof controls>) => {
		setClientBackpack({
			equip: "1",
			backpack: new Map([
				["1", { name: "Sword", icon: "rbxassetid://0", tooltip: "A sharp blade", metadata: {} }],
				["2", { name: "Axe", icon: "rbxassetid://0", tooltip: "", metadata: {} }],
			]),
		});

		return (
			<>
				<BackpackStyleProvider />

				<BackpackSlot
					id="1"
					layoutOrder={1}
					visibility={true}
					data={{ name: "Sword", icon: "rbxassetid://0", tooltip: "A sharp blade", metadata: {} }}
					equipped={false}
				/>
			</>
		);
	},
};

export = story;
