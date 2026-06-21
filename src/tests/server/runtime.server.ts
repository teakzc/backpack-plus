import { Players, ReplicatedStorage } from "@rbxts/services";
import { giveTool, initializeBackpackServer, registerPlayer, unregisterPlayer, updateTool } from "../../lib/server";

initializeBackpackServer();

Players.PlayerAdded.Connect((player) => {
	registerPlayer(player);

	const id = giveTool(player, {
		name: "Sword",
		tooltip: "A test tool",
		metadata: {
			lvl: 10,
		},
		instance: ReplicatedStorage.ClassicSword,
	});

	task.wait(5);

	print("Changing!");

	updateTool(player, id, (tool) => ({
		...tool,
		metadata: {
			lvl: 25,
		},
	}));
});

Players.PlayerRemoving.Connect((client) => unregisterPlayer(client));
