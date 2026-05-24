import { Players, ReplicatedStorage } from "@rbxts/services";
import { giveTool, initializeBackpackServer, registerPlayer } from "../../lib/server";

initializeBackpackServer();

Players.PlayerAdded.Connect((player) => {
	registerPlayer(player);

	giveTool(player, {
		name: "Sword",
		tooltip: "A test tool",
		metadata: {},
		instance: ReplicatedStorage.ClassicSword,
	});
});
