import { Players } from "@rbxts/services";
import { giveTool, initializeBackpackServer, registerPlayer } from "../../lib";

initializeBackpackServer();

Players.PlayerAdded.Connect((player) => {
	registerPlayer(player);

	giveTool(player, {
		name: "Test Tool",
		tooltip: "A test tool",
		icon: "rbxasset://textures/Icons/Tools/Tool.png",
		metadata: {},
	});
});
