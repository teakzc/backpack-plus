import { Players, ReplicatedStorage } from "@rbxts/services";
import { add_tool, on_tool_move, register_client, remove_all, remove_client } from "../../lib/server";

print("[INFO]: SERVER RUNTIME INITIALIZED");

on_tool_move((c, asdasd) => {});

Players.PlayerAdded.Connect((client) => {
	print(`[INFO]: REGISTERING ${client.Name}`);

	register_client(client);

	add_tool(client, {
		name: "Sword",
		tooltip: "mighty",
		metadata: {
			type: "sword",
			rarity: "epic",
		},
		tool: ReplicatedStorage.ClassicSword,
	});

	add_tool(client, {
		name: "Murasama",
		tooltip: "There will be blood!",
		metadata: {
			type: "katana",
			rarity: "epic",
		},
		tool: ReplicatedStorage.Sword,
	});

	add_tool(client, {
		name: "nothing?",
		tooltip: "it may be useful",
		image: "rbxassetid://113226473170832",
		metadata: {
			type: "misc",
			rarity: "legendary",
		},
	});

	add_tool(client, {
		name: "sandwich",
		tooltip: "yummy!",
		image: "rbxassetid://74663209541357",
		metadata: {
			type: "food",
			rarity: "legendary",
		},
	});

	add_tool(client, {
		name: "Twilight",
		tooltip: "there is a monster in the forest",
		metadata: {
			type: "sword",
			rarity: "common",
		},
	});

	add_tool(client, {
		name: "bow",
		tooltip: "PLACEHOLDER TOOLTIP",
		metadata: {
			type: "bow",
			rarity: "common",
		},
	});
});

Players.PlayerRemoving.Connect((client) => {
	remove_client(client);
});

game.BindToClose(() => {
	remove_all();
});
