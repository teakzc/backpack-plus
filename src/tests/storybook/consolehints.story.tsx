import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import InventoryConsoleHints from "@/client/ui/components/inventory/consolehints";
import BackpackStyleProvider from "@/client/ui/components/styleprovider";

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => {
		return (
			<>
				<BackpackStyleProvider />
				<InventoryConsoleHints />
			</>
		);
	},
};

export = story;
