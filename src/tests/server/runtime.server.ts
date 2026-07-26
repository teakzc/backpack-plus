import { Players, ReplicatedStorage } from "@rbxts/services";
import { giveTool, initializeBackpackServer, registerPlayer, unregisterPlayer } from "../../lib/server";

initializeBackpackServer();

Players.PlayerAdded.Connect((player) => {
	registerPlayer(player);

	giveTool(player, {
		name: "Sword",
		tooltip: "A test tool",
		metadata: {
			lvl: 10,
		},
		instance: ReplicatedStorage.ClassicSword,
	});

	giveTool(player, {
		name: "Cake",
		tooltip: "lie",
		metadata: {
			lvl: 10,
		},
		instance: ReplicatedStorage.Sword,
	});

	giveTool(player, {
		name: "Axe",
		tooltip: "oooh",

		metadata: {
			lvl: 10,
		},
		instance: ReplicatedStorage.Sword,
	});

	giveTool(player, {
		name: "Diamond",
		tooltip: "Shiny!",
		metadata: {
			lvl: 10,
		},
		instance: ReplicatedStorage.Sword,
	});
});

Players.PlayerRemoving.Connect((client) => unregisterPlayer(client));
