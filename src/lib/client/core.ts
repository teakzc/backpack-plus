import { client } from "@rbxts/charm-sync";
import { clientRegistry, equippedRegistry, inventorySyncRemotes } from "../shared/networking";
import { computed, observe } from "@rbxts/charm";
import { Players } from "@rbxts/services";
import { tool } from "../server";
import { push, removeValue, set } from "@rbxts/sift/out/Array";
import { equals } from "@rbxts/sift/out/Dictionary";
import { backpackState, draggingState, inventorySelectionState, toolbarState } from "./atoms";

export const inventory = computed(() => {
	return clientRegistry()[Players.LocalPlayer.Name] ?? [];
});

const clientSyncer = client({
	atoms: {
		clientRegistry: clientRegistry,
		equippedRegistry: equippedRegistry,
	},
	ignoreUnhydrated: true,
});

inventorySyncRemotes.syncState.connect((payload) => {
	clientSyncer.sync(payload);
});

inventorySyncRemotes.requestState.fire();

// CHARM-SYNC ABOVE
// CORE FUNCTION BELOW

export const INVENTORY_PROPERTIES = {
	TOOLBAR_AMOUNT: 10,
	INVENTORY_FONT: new Font("rbxasset://fonts/families/ComicNeueAngular.json"),
	MOBILE: false,
};

interface inventoryInitializeData {
	TOOLBAR_AMOUNT: number;
	MOBILE: boolean;
	INVENTORY_FONT?: Font;
}

interface inventoryCustomizeData {
	TOOLBAR_AMOUNT?: number;
	MOBILE?: boolean;
	INVENTORY_FONT?: Font;
}

/**
 * Initialize the inventory
 *
 * @param TOOLBAR_AMOUNT The amount of slots in the toolbar
 * @param INVENTORY_FONT The font to use (Default Comic Neue Angular)
 */
export function initialize_inventory({
	TOOLBAR_AMOUNT = 10,
	INVENTORY_FONT = new Font("rbxasset://fonts/families/ComicNeueAngular.json"),
	MOBILE = false,
}: inventoryInitializeData) {
	INVENTORY_PROPERTIES.TOOLBAR_AMOUNT = TOOLBAR_AMOUNT;
	INVENTORY_PROPERTIES.INVENTORY_FONT = INVENTORY_FONT;
	INVENTORY_PROPERTIES.MOBILE = MOBILE;

	const slotsSetup: { [key: number]: tool | "empty" | "drag" } = {};

	for (let i = 0; i <= TOOLBAR_AMOUNT; i++) {
		slotsSetup[i] = "empty";
	}

	toolbarState(slotsSetup as (tool | "empty" | "drag")[]);

	//StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);
}

/**
 * Customizes the inventory value
 *
 * @param data The new values to update
 */
export function customize_inventory(data: inventoryCustomizeData) {
	/**
	 * Unfortunately typescript wouldent let me do this
	 *
	 * ```
	 * for (const [key, value] of pairs(data)) {
	 *		INVENTORY_PROPERTIES[key] = value;
	 * }
	 * ```
	 */

	if (data.INVENTORY_FONT) {
		INVENTORY_PROPERTIES.INVENTORY_FONT = data.INVENTORY_FONT;
	}

	if (data.TOOLBAR_AMOUNT) {
		INVENTORY_PROPERTIES.TOOLBAR_AMOUNT = data.TOOLBAR_AMOUNT;
	}

	if (data.MOBILE !== undefined) {
		INVENTORY_PROPERTIES.MOBILE = data.MOBILE;
	}
}

observe(inventory, (tool) => {
	// Check if we can fill the slots

	const newTool = table.clone(tool);
	const currentState = toolbarState();

	let fill = false;
	for (let i = 0; i < INVENTORY_PROPERTIES.TOOLBAR_AMOUNT; i++) {
		// Iterates `TOOLBAR_AMOUNT` of times from 0 to `TOOLBAR_AMOUNT` - 1
		if (currentState[i] === "empty") {
			// Empty slot, so assign
			toolbarState((current) => {
				return set(current, i + 1, newTool);
			});

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

			for (let i = 0; i < INVENTORY_PROPERTIES.TOOLBAR_AMOUNT; i++) {
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

/**
 * Find the location of the tool
 *
 * @param tool The tool to find
 * @returns The location of the tool
 */
export function findTool(tool: tool): "toolbar" | "backpack" | undefined {
	// Find whether it is in toolbar or inventory

	const toolbar = toolbarState().find((V) => (V !== "drag" && V !== "empty" ? equals(V, tool) : false));
	const backpack = backpackState().find((V) => (V !== "drag" ? equals(V, tool) : false));

	return toolbar ? "toolbar" : backpack ? "backpack" : undefined;
}

/**
 * Equips a tool
 *
 * @param tool The `tool` to equip or `undefined | nil` to unequip
 */
export function equipTool(tool: tool | undefined) {
	inventorySyncRemotes.equipTool.request(tool);
}

/**
 * Drags a tool
 *
 * @param tool The tool to drag
 * @param mouseOffset The offset of the dragged tool
 */
export function dragTool(tool: tool, mouseOffset?: Vector2) {
	const location = findTool(tool);

	if (!location) return;

	let preserveIndex = -1;

	if (location === "toolbar") {
		const index = toolbarState().findIndex((V) => (V !== "drag" && V !== "empty" ? equals(V, tool) : false));
		if (index === -1 || index === undefined) return; // Does not exist

		preserveIndex = index;

		toolbarState((current) => set(current, index + 1, "drag"));
	} else if (location === "backpack") {
		const index = backpackState().findIndex((V) => (V !== "drag" ? equals(V, tool) : false));

		if (index === -1 || index === undefined) return; // Does not exist

		backpackState((current) => set(current, index + 1, "drag"));
	}

	draggingState({
		tool: tool,
		from: location,
		offset: mouseOffset ?? Vector2.zero,
		index: preserveIndex,
	});
}

export function dropTool() {
	const data = draggingState();

	if (!data) return;

	const selection = inventorySelectionState();

	const newTool = table.clone(data.tool);

	if (selection === "backpack") {
		if (data.from === "backpack") {
			// Drop it back into the backpack!
			// But where?
			// At the original place you dragged it!!!

			const index = backpackState().findIndex((V) => V === "drag");

			if (index === -1) return;

			// Replaces the "drag" with the tool

			backpackState((current) => set(current, index + 1, newTool));
		} else {
			// From the TOOLBAR, so now swap the positions and push

			// Add to backpack
			backpackState((current) => push(current, newTool));

			// Remove from toolbar

			const index = toolbarState().findIndex((V) => V === "drag");

			if (index === -1) return;

			toolbarState((current) => set(current, index + 1, "empty"));
		}
	} else if (typeIs(selection, "number")) {
		// Selected a slot on the toolbar
		if (data.from === "toolbar") {
			// Swaps them

			const index = toolbarState().findIndex((V) => V === "drag");

			if (index === -1) return;

			// Swap

			const otherValue = toolbarState()[selection];

			toolbarState((current) => {
				const clone = table.clone(current);
				clone[index] = otherValue;
				clone[selection] = newTool;
				return clone;
			});
		} else if (data.from === "backpack") {
			// From backpack to toolbar

			// Remove backpack
			backpackState((current) => removeValue(current, "drag"));

			// Add to toolbar

			toolbarState((current) => set(current, selection + 1, newTool));
		}
	} else if (selection === undefined) {
		// Cancel, by dropping out of tool/inventory

		if (data.from === "backpack") {
			// Return back to the backpack

			const index = backpackState().findIndex((V) => V === "drag");

			if (index === -1) return;

			backpackState((current) => set(current, index + 1, data.tool));
		} else if (data.from === "toolbar") {
			// Put back

			const index = toolbarState().findIndex((V) => V === "drag");

			if (index === -1) return;

			toolbarState((current) => set(current, index + 1, data.tool));
		}
	}

	draggingState(undefined);
}
