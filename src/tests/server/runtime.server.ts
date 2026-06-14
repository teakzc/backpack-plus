import { Players, ReplicatedStorage } from "@rbxts/services";
import { giveTool, initializeBackpackServer, registerPlayer, unregisterPlayer } from "../../lib/server";

initializeBackpackServer();

Players.PlayerAdded.Connect((player) => {
	registerPlayer(player);

	giveTool(player, {
		name: "Sword",
		tooltip: "A test tool",
		metadata: {
			w: "aa",
		},
		instance: ReplicatedStorage.ClassicSword,
	});

	giveTool(player, {
		name: "Axe",
		tooltip: "A test tool",
		metadata: {
			lvl: 25,
		},
		instance: ReplicatedStorage.ClassicSword,
	});

	giveTool(player, {
		name: "Battlesworwd",
		tooltip: "A test tool",
		metadata: {},
		instance: ReplicatedStorage.ClassicSword,
	});

	giveTool(player, {
		name: "Scepter",
		tooltip: "A test tool",
		metadata: {},
		instance: ReplicatedStorage.ClassicSword,
	});

	giveTool(player, {
		name: "Yoyo",
		tooltip: "A test tool",
		metadata: {},
		instance: ReplicatedStorage.ClassicSword,
	});
});

Players.PlayerRemoving.Connect((client) => unregisterPlayer(client));
