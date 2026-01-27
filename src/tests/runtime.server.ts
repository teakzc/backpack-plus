import { Players } from "@rbxts/services";
import { addTool, register_client, remove_all, remove_client } from "../lib/server";

Players.PlayerAdded.Connect((client) => {
	register_client(client);

	addTool(client, {
		name: "Sword",
		tooltip: "Wow you can read this",
	});

	addTool(client, {
		image: "rbxassetid://113226473170832",
		tooltip: "Wow",
	});

	addTool(client, {
		tooltip: "Wow you can read this super suoer long text wow wow wow wow wow",
	});

	addTool(client, {
		name: "Balloon",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can read",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});

	addTool(client, {
		name: "Flower",
		image: "rbxassetid://113226473170832",
		tooltip: "Wow you can",
	});
});

Players.PlayerRemoving.Connect((client) => {
	remove_client(client);
});

game.BindToClose(() => {
	remove_all();
});
