import { client } from "@rbxts/charm-sync";
import { clientRegistry, inventorySyncRemotes } from "../shared/networking";
import { atom, computed, observe } from "@rbxts/charm";
import { Players } from "@rbxts/services";
import { tool } from "../server";
import { push, removeValue, set } from "@rbxts/sift/out/Array";
import { equals } from "@rbxts/sift/out/Dictionary";

export const inventory = computed(() => {
	return clientRegistry()[Players.LocalPlayer.Name] ?? [];
});

const clientSyncer = client({
	atoms: {
		clientRegistry: clientRegistry,
	},
	ignoreUnhydrated: true,
});

inventorySyncRemotes.syncState.connect((payload) => {
	clientSyncer.sync(payload);
});

inventorySyncRemotes.requestState.fire();

// CHARM-SYNC ABOVE
// CORE FUNCTION BELOW

let TOOLBAR_AMOUNT = 10;

const slotsSetup: { [key: number]: tool | "empty" | "drag" } = {};

for (let i = 0; i < TOOLBAR_AMOUNT; i++) {
	slotsSetup[i] = "empty";
}

const toolbarState = atom<(tool | "empty" | "drag")[]>(slotsSetup as (tool | "empty" | "drag")[]); // Inside the toolbar
const backpackState = atom<(tool | "drag")[]>([]); // Inside the full inventory
const draggingState = atom<{
	tool: tool;
	from: "toolbar" | "backpack";
	position: Vector2;
}>();

interface initializeData {
	toolbarAmount: number;
}

export function initialize({ toolbarAmount }: initializeData) {
	TOOLBAR_AMOUNT = toolbarAmount;
}

observe(inventory, (tool) => {
	// Check if we can fill the slots

	const newTool = table.clone(tool);
	const currentState = toolbarState();

	let fill = false;
	for (let i = 0; i < TOOLBAR_AMOUNT; i++) {
		// Iterates `TOOLBAR_AMOUNT` of times from 0 to `TOOLBAR_AMOUNT` - 1
		if (currentState[i] === "empty") {
			// Empty slot, so assign
			toolbarState((current) => set(current, i, newTool));

			fill = true;

			break;
		}
	}

	if (!fill) {
		// Is full, so go into inventory
		backpackState((current) => push(current, newTool));
	}

	return () => {
		toolbarState((current) => {
			const clone = table.clone(current);

			for (let i = 0; i < TOOLBAR_AMOUNT; i++) {
				const toolCheck = clone[i];

				if (toolCheck === "drag" || toolCheck === "empty") continue;

				if (toolCheck.id !== newTool.id) continue;

				// Tool ID matching
				// So remove it by assigning empty, not undefined because it might crash out :skull:
				clone[i] = "empty";

				break;
			}

			return clone;
		});

		backpackState((current) => removeValue(current, newTool));
	};
});

// Inventory Manipulation

export function findTool(tool: tool): "toolbar" | "inventory" | undefined {
	// Find whether it is in toolbar or inventory

	const toolbar = toolbarState().find((V) => (V !== "drag" && V !== "empty" ? equals(V, tool) : false));
	const backpack = backpackState().find((V) => (V !== "drag" ? equals(V, tool) : false));

	return (toolbar ? )
}

export function dragTool(tool: tool) {}
