import { Players, ReplicatedStorage } from "@rbxts/services";
import { add_tool, register_client, remove_all, remove_client } from "../../lib/server";

print("[INFO]: SERVER RUNTIME INITIALIZED");

Players.PlayerAdded.Connect((client) => {
	print(`[INFO]: REGISTERING ${client.Name}`);

	register_client(client);

	add_tool(
		client,
		{
			name: "Sword",
			tooltip: "mighty",
			metadata: {
				type: "sword",
				rarity: "epic",
			},
			tool: ReplicatedStorage.ClassicSword,
		},
		1,
	);

	add_tool(
		client,
		{
			name: "Murasama",
			tooltip: "There will be blood!",
			metadata: {
				type: "katana",
				rarity: "epic",
			},
			tool: ReplicatedStorage.Sword,
		},
		0,
	);

	add_tool(
		client,
		{
			name: "Spear of Justice",
			tooltip: "undying",
			metadata: {
				type: "spear",
				rarity: "legendary",
			},
		},
		3,
	);

	add_tool(
		client,
		{
			name: "A NUCLEAR BOMB",
			tooltip: "i have become death destroyer of worlds",
			metadata: {
				type: "explosive",
				rarity: "legendary",
			},
		},
		2,
	);

	add_tool(
		client,
		{
			name: "Twilight",
			tooltip: "there is a monster in the forest",
			metadata: {
				type: "sword",
				rarity: "common",
			},
		},
		"inventory",
	);

	add_tool(
		client,
		{
			name: "bow",
			tooltip: "PLACEHOLDER TOOLTIP",
			metadata: {
				type: "bow",
				rarity: "common",
			},
		},
		"inventory",
	);
});

Players.PlayerRemoving.Connect((client) => {
	remove_client(client);
});

game.BindToClose(() => {
	remove_all();
});
