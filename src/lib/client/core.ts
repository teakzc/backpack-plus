import { client } from "@rbxts/charm-sync";
import { clientRegistry, equippedRegistry, backpackSyncRemotes } from "../shared/networking";
import { atom, computed, observe, subscribe } from "@rbxts/charm";
import { Players, StarterGui, UserInputService } from "@rbxts/services";
import { tool } from "../server";
import { push, removeValue, set } from "@rbxts/sift/out/Array";
import { equals } from "@rbxts/sift/out/Dictionary";
import {
	inventoryState,
	draggingState,
	equippedState,
	filterList,
	backpackSelectionState,
	toolbarState,
	inventoryVisibilityState,
	clickOffState,
} from "./atoms";

export const BACKPACK_PROPERTIES = {
	TOOLBAR_AMOUNT: 10,
	SCORE_THRESHOLD: 0.3,
	BACKPACK_FONT: new Font("rbxasset://fonts/families/ComicNeueAngular.json"),
	MOBILE: false,
	BACKPACK_TEXT: atom<string>("Inventory"),
};

interface backpackData {
	TOOLBAR_AMOUNT?: number;
	SCORE_THRESHOLD?: number;
	BACKPACK_FONT?: Font;
	BACKPACK_TEXT?: string;
}

/**
 * Initialize the backpack
 *
 * @param TOOLBAR_AMOUNT The amount of slots in the toolbar (overrides base amount)
 * @param BACKPACK_FONT The font to use (Default Comic Neue Angular)
 * @param BACKPACK_TEXT The text to display on the backpack header
 * @param SCORE_THRESHOLD The fuzzy-search score threshold (0 to 1)
 */
export function initialize_backpack({
	TOOLBAR_AMOUNT,
	BACKPACK_FONT = new Font("rbxasset://fonts/families/ComicNeueAngular.json"),
	BACKPACK_TEXT = "Inventory",
	SCORE_THRESHOLD = 0.3,
}: backpackData) {
	BACKPACK_PROPERTIES.BACKPACK_FONT = BACKPACK_FONT;
	BACKPACK_PROPERTIES.MOBILE = UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled;
	BACKPACK_PROPERTIES.BACKPACK_TEXT(BACKPACK_TEXT);
	BACKPACK_PROPERTIES.TOOLBAR_AMOUNT = BACKPACK_PROPERTIES.MOBILE ? 6 : 10;
	BACKPACK_PROPERTIES.SCORE_THRESHOLD = SCORE_THRESHOLD;

	if (TOOLBAR_AMOUNT !== undefined) BACKPACK_PROPERTIES.TOOLBAR_AMOUNT = TOOLBAR_AMOUNT;

	const slotsSetup: { [key: number]: tool | "empty" | "drag" } = {};

	for (let i = 0; i < BACKPACK_PROPERTIES.TOOLBAR_AMOUNT; i++) {
		slotsSetup[i + 1] = "empty";
	}

	toolbarState(slotsSetup as (tool | "empty" | "drag")[]);

	StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

	const clientSyncer = client({
		atoms: {
			clientRegistry: clientRegistry,
			equippedRegistry: equippedRegistry,
		},
		ignoreUnhydrated: true,
	});

	backpackSyncRemotes.syncState.connect((payload) => {
		clientSyncer.sync(payload);
	});

	backpackSyncRemotes.requestState.fire();

	const backpackState = computed(() => {
		const toolbarMap = new Map<string, number>();
		const toolbar = toolbarState();

		// Sets from 1 to 10œ

		for (const tool of toolbar) {
			if (tool === "drag" || tool === "empty") continue;

			const index = toolbar.findIndex((V) => V === tool);

			if (index === -1) continue;

			toolbarMap.set(tool.id, index + 1);
		}

		return {
			toolbar: toolbarMap,
			inventory: inventoryState()
				.map((value) => {
					return value !== "drag" ? value.id : undefined;
				})
				.filterUndefined(),
		};
	});

	subscribe(backpackState, (current) => {
		backpackSyncRemotes.hydratePositions.fire(current);
	});

	const backpack = computed(() => {
		return clientRegistry()[Players.LocalPlayer?.Name ?? "MOCK_CLIENT"] ?? [];
	});

	observe(backpack, (tool) => {
		// Check if we can fill the slots

		const newTool = table.clone(tool);

		const pos = newTool.position;

		if (pos !== undefined) {
			if (pos === "inventory") {
				newTool.position = undefined;
				inventoryState((current) => push(current, newTool));
			} else if (typeIs(pos, "number")) {
				toolbarState((current) => {
					if (current[pos] === "empty" || current[pos] === "drag") {
						// We can fill it

						newTool.position = undefined;

						return set(current, pos, newTool);
					} else return current;
				});
			}
		} else {
			fillBackpack(newTool);
		}

		return () => {
			// Removes it

			toolbarState((current) => {
				const clone = table.clone(current);

				for (let i = 0; i < BACKPACK_PROPERTIES.TOOLBAR_AMOUNT; i++) {
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

			inventoryState((current) => removeValue(current, newTool));
		};
	});
}

/**
 * Customizes the backpack value
 *
 * @param data The new values to update
 */
export function customize_backpack(data: backpackData) {
	/**
	 * Unfortunately typescript wouldent let me do this
	 *
	 * ```
	 * for (const [key, value] of pairs(data)) {
	 *		BACKPACK_PROPERTIES[key] = value;
	 * }
	 * ```
	 */

	if (data.BACKPACK_FONT) {
		BACKPACK_PROPERTIES.BACKPACK_FONT = data.BACKPACK_FONT;
	}

	if (data.TOOLBAR_AMOUNT) {
		BACKPACK_PROPERTIES.TOOLBAR_AMOUNT = data.TOOLBAR_AMOUNT;
	}

	if (data.BACKPACK_TEXT) {
		BACKPACK_PROPERTIES.BACKPACK_TEXT(data.BACKPACK_TEXT);
	}

	if (data.SCORE_THRESHOLD) {
		BACKPACK_PROPERTIES.SCORE_THRESHOLD = data.SCORE_THRESHOLD;
	}
}

function fillBackpack(tool: tool) {
	const currentState = toolbarState();

	let fill = false;
	for (let i = 0; i < BACKPACK_PROPERTIES.TOOLBAR_AMOUNT; i++) {
		// Iterates `TOOLBAR_AMOUNT` of times from 0 to `TOOLBAR_AMOUNT` - 1
		if (currentState[i] === "empty") {
			// Empty slot, so assign
			toolbarState((current) => {
				return set(current, i + 1, tool);
			});

			fill = true;

			break;
		}
	}

	if (!fill) {
		// Is full, so go into inventory
		inventoryState((current) => push(current, tool));
	}
}

/**
 * Find the location of the `tool`
 *
 * @param tool The `tool` to find
 * @returns The location of the `tool`
 */
export function find_tool(tool: tool): "toolbar" | "backpack" | undefined {
	// Find whether it is in toolbar or inventory

	const toolbar = toolbarState().find((V) => (V !== "drag" && V !== "empty" ? equals(V, tool) : false));
	const backpack = inventoryState().find((V) => (V !== "drag" ? equals(V, tool) : false));

	return toolbar ? "toolbar" : backpack ? "backpack" : undefined;
}

/**
 * Equips a `tool`
 *
 * @param tool The `tool` to equip or `undefined` to unequip
 */
export function equip_tool(tool: tool | undefined) {
	backpackSyncRemotes.equipTool.request(tool);
}

/**
 * Equips a `tool` from a number
 *
 * @param tool The `tool`'s number on the toolbar to equip
 */
export function equip_tool_number(tool: number) {
	const toEquip = toolbarState()[tool === 0 ? 9 : tool - 1];

	if (toEquip === undefined) return;

	// If you select nothing,
	if (toEquip === "drag" || toEquip === "empty") {
		backpackSyncRemotes.equipTool.request(undefined);

		return;
	}

	// If you select the same tool, unequip
	if (get_equipped()?.id === toEquip.id) {
		backpackSyncRemotes.equipTool.request(undefined);

		return;
	}

	backpackSyncRemotes.equipTool.request(toEquip);
}

const toolDropState = new Map<string, () => void>();
const toolDragState = new Map<string, () => void>();

/**
 * Drags a tool
 *
 * @param tool The tool to drag
 * @param mouseOffset The offset of the dragged tool
 *
 * @return A function that accepts a callback when the tool is dropped
 */
export function drag_tool(tool: tool, mouseOffset?: Vector2) {
	const location = find_tool(tool);

	if (!location) return;

	let preserveIndex = -1;

	if (location === "toolbar") {
		const index = toolbarState().findIndex((V) => (V !== "drag" && V !== "empty" ? equals(V, tool) : false));
		if (index === -1 || index === undefined) return; // Does not exist

		preserveIndex = index;

		toolbarState((current) => set(current, index + 1, "drag"));
	} else if (location === "backpack") {
		const index = inventoryState().findIndex((V) => (V !== "drag" ? equals(V, tool) : false));

		if (index === -1 || index === undefined) return; // Does not exist

		inventoryState((current) => set(current, index + 1, "drag"));
	}

	draggingState({
		tool: tool,
		from: location,
		offset: mouseOffset ?? Vector2.zero,
		index: preserveIndex,
	});

	const fn = toolDragState.get(tool.id);

	if (fn) {
		fn();
	}
}

/**
 *
 * @param tool The `tool` to listen to
 * @param callback The function to run when the `tool` is dropped successfully
 * @returns Cleanup function to disconnect
 */
export function on_dropped(tool: tool, callback: () => void) {
	toolDropState.set(tool.id, callback);

	return () => {
		toolDropState.delete(tool.id);
	};
}

/**
 *
 * @param tool The tool to listen to
 * @param callback The function to run when the tool is dragged successfully
 * @returns Cleanup function to disconnect
 */
export function on_dragged(tool: tool, callback: () => void) {
	toolDragState.set(tool.id, callback);
	return () => {
		toolDragState.delete(tool.id);
	};
}

/**
 * Drops the tool that is held
 */
export function drop_tool() {
	const data = draggingState();

	if (!data) return;

	const selection = backpackSelectionState();

	const newTool = table.clone(data.tool);

	if (selection === "backpack") {
		if (data.from === "backpack") {
			// Drop it back into the backpack!
			// But where?
			// At the original place you dragged it!!!

			const index = inventoryState().findIndex((V) => V === "drag");

			if (index === -1) return;

			// Replaces the "drag" with the tool

			inventoryState((current) => set(current, index + 1, newTool));
		} else {
			// From the TOOLBAR, so now swap the positions and push

			// Add to backpack
			inventoryState((current) => push(current, newTool));

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
			inventoryState((current) => removeValue(current, "drag"));

			// Add to toolbar

			toolbarState((current) => set(current, selection + 1, newTool));
		}
	} else if (selection === undefined) {
		// Cancel, by dropping out of tool/inventory

		if (data.from === "backpack") {
			// Return back to the backpack

			const index = inventoryState().findIndex((V) => V === "drag");

			if (index === -1) return;

			inventoryState((current) => set(current, index + 1, data.tool));
		} else if (data.from === "toolbar") {
			// Put back

			const index = toolbarState().findIndex((V) => V === "drag");

			if (index === -1) return;

			toolbarState((current) => set(current, index + 1, data.tool));
		}
	}

	draggingState(undefined);

	const fn = toolDropState.get(data.tool.id);

	if (fn) {
		fn();
	}
}

/**
 * Adds filter to `tool`
 *
 * You can also directly modify the filter `filterList` atom!
 *
 * @param filter The filter to add
 */
export function add_filter(filter: (tool: tool) => boolean) {
	filterList((current) => {
		return [...current, filter];
	});
}

/**
 * Remove filter from `tool`
 *
 * @param filter The filter of the `tool` to remove
 */
export function remove_filter(filter: (tool: tool) => boolean) {
	const index = filterList().findIndex((V) => V === filter);

	if (index === -1) return;

	filterList((current) => {
		return removeValue(current, filter);
	});
}

/**
 * Clears all filters
 */
export function clear_filters() {
	filterList([]);
}

/**
 * Gets the currently equipped `tool`
 *
 * @returns The `tool` or `undefined`
 */
export function get_equipped() {
	return equippedState();
}

/**
 * Gets the currently dragged `tool`
 *
 * @returns The `tool` or `undefined`
 */
export function get_dragged() {
	return draggingState();
}

/**
 * Toggle inventory full display
 *
 * @param state Whether to display the full backpack or not
 */
export function toggle_inventory(state?: boolean) {
	inventoryVisibilityState(state === undefined ? (current) => !current : state);

	if (!state) {
		drop_tool();
	}
}

/**
 * Gets visibility of inventory
 *
 * @returns boolean, whether it is visible or not
 */
export function get_visibility() {
	return inventoryVisibilityState();
}

const inputs = {
	Zero: 0,
	One: 1,
	Two: 2,
	Three: 3,
	Four: 4,
	Five: 5,
	Six: 6,
	Seven: 7,
	Eight: 8,
	Nine: 9,
};

/**
 * Initializes a utility function that detect inputs to automatically equip tools
 *
 * This is useful if you just need a normal backpack and your game doesn't need to control how the client equips the tools
 */
export function initialize_inputs() {
	UserInputService.InputBegan.Connect((input, GPE) => {
		if (GPE) return;

		// KeyCode.Zero starts at 48
		// KeyCode.One starts at 49
		// KeyCode.Nine ends at 57

		if (
			input.UserInputType === Enum.UserInputType.MouseButton1 ||
			input.UserInputType === Enum.UserInputType.Touch
		) {
			// Touched

			if (!clickOffState()) toggle_inventory(false);

			return;
		}

		const validation = inputs[input.KeyCode.Name as keyof typeof inputs] as number | undefined;

		if (validation === undefined) return;

		if (validation > 9 || validation < 0) return;

		equip_tool_number(validation);
	});
}
