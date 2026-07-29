import { Players, ReplicatedStorage } from "@rbxts/services";
import {
	giveTool,
	initializeBackpackServer,
	onToolEquipped,
	onToolUnequipped,
	registerPlayer,
	unregisterPlayer,
} from "@/server";

function log(hook: string, detail?: string) {
	print(`[hooks] ${hook}${detail !== undefined ? ` — ${detail}` : ""}`);
}

// NOTE: the server hooks currently pass only the ToolId, so with more than one
// player in the server these can't tell you *who* equipped. `client` is in scope
// at both fire sites (server/core.ts:52,60) if that signature changes.
onToolEquipped((toolId) => log("onToolEquipped", toolId));
onToolUnequipped((toolId) => log("onToolUnequipped", toolId));

// Cleanup must actually unregister — this listener should never print.
const cleanup = onToolEquipped(() => log("onToolEquipped", "LEAKED: cleaned-up listener still firing"));
cleanup();

// A throwing listener must not stop the ones registered after it.
onToolEquipped(() => error("intentional test error — the warn above is expected"));
onToolEquipped((toolId) => log("onToolEquipped", `survived a throwing listener (${toolId})`));

initializeBackpackServer();

Players.PlayerAdded.Connect((player) => {
	registerPlayer(player);

	giveTool(player, {
		name: "Sword",
		tooltip: "A test tool",
		metadata: {
			lvl: 10,
			type: "weapon",
		},
		instance: ReplicatedStorage.ClassicSword,
	});

	giveTool(player, {
		name: "Cake",
		tooltip: "lie",
		metadata: {
			lvl: 1,
			type: "food",
		},
		instance: ReplicatedStorage.Sword,
	});

	giveTool(player, {
		name: "Axe",
		tooltip: "oooh",

		metadata: {
			lvl: 25,
			type: "weapon",
		},
		instance: ReplicatedStorage.Sword,
	});

	giveTool(player, {
		name: "Diamond",
		tooltip: "Shiny!",
		metadata: {
			lvl: 1,
			type: "material",
		},
		instance: ReplicatedStorage.Sword,
	});
});

Players.PlayerRemoving.Connect((client) => unregisterPlayer(client));
