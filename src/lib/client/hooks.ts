import { getClientBackpackOrder, getClientEquipped, getClientHotbar, getInventoryVisibility } from "@/client/charm";
import { ToolId } from "@/shared/types";
import { subscribe } from "@rbxts/charm";

function createHook<T extends unknown[]>() {
	const listeners = new Set<(...args: T) => void>();

	function register(listener: (...args: T) => void) {
		listeners.add(listener);

		return () => {
			listeners.delete(listener);
		};
	}

	function fire(...args: T) {
		// Copy first: a listener may register or unregister during the loop.
		for (const listener of [...listeners]) {
			// One bad consumer callback must not break the rest of the loop.
			const [ok, err] = pcall(listener, ...args);
			if (!ok) warn(`[backpack-plus] hook listener errored: ${err}`);
		}
	}

	return [register, fire] as const;
}

function createLatchHook() {
	const [register, fire] = createHook();
	let fired = false;

	function registerLatched(listener: () => void) {
		if (fired) {
			// Already happened — run now rather than never.
			const [ok, err] = pcall(listener);
			if (!ok) warn(`[backpack-plus] hook listener errored: ${err}`);

			return () => {};
		}

		return register(listener);
	}

	function fireOnce() {
		if (fired) return;
		fired = true;

		fire();
	}

	return [registerLatched, fireOnce] as const;
}

// ====================================================================

const toolEquipped = createHook<[ToolId]>();

subscribe(getClientEquipped, (value, old) => {
	if (value === old) return;

	if (value !== "") {
		toolEquipped[1](value);
	}
});

/**
 * Runs when a tool becomes the equipped one.
 *
 * Fires on sync arrival, not when `equipTool` is called, so it reflects what the
 * server actually accepted rather than an optimistic local guess.
 *
 * @param callback Receives the newly equipped tool.
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onToolEquipped(callback: (toolId: ToolId) => void) {
	return toolEquipped[0](callback);
}

// ====================================================================

const toolUnequipped = createHook<[ToolId]>();

subscribe(getClientEquipped, (value, old) => {
	if (value === old) return;

	if (value === "") {
		toolUnequipped[1](old);
	}
});

/**
 * Runs when the equipped tool is put away and nothing replaces it.
 *
 * Fires on sync arrival, not when `equipTool` is called. Swapping directly from
 * one tool to another reports `onToolEquipped` only.
 *
 * @param callback Receives the tool that was unequipped.
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onToolUnequipped(callback: (toolId: ToolId) => void) {
	return toolUnequipped[0](callback);
}

// ====================================================================

/**
 * @hidden
 * @client
 */
export const toolAdded = createHook<[ToolId]>();

/**
 * Runs when a tool arrives in the backpack.
 *
 * @param callback Receives the added tool.
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onToolAdded(callback: (toolId: ToolId) => void) {
	return toolAdded[0](callback);
}

// ====================================================================

/**
 * @hidden
 * @client
 */
export const toolRemoved = createHook<[ToolId]>();

/**
 * Runs when a tool leaves the backpack.
 *
 * @param callback Receives the removed tool.
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onToolRemoved(callback: (toolId: ToolId) => void) {
	return toolRemoved[0](callback);
}

// ====================================================================

const inventoryToggled = createHook<[boolean]>();

// subscribe, not effect: effect runs its body eagerly on load, firing before
// any consumer can register.
subscribe(getInventoryVisibility, (value, old) => {
	if (value === old) return;

	inventoryToggled[1](value);
});

/**
 * Runs when the inventory panel opens or closes.
 *
 * @param callback Receives `true` when opening, `false` when closing.
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onInventoryToggled(callback: (visible: boolean) => void) {
	return inventoryToggled[0](callback);
}

// ====================================================================

/**
 * Fired by `initializeBackpackClient` once the first `SyncState` payload lands.
 * @hidden
 * @client
 */
export const backpackLoaded = createLatchHook();

/**
 * Runs once the backpack has received its initial state from the server.
 *
 * Before this fires, `getClientBackpack()` returns the empty default, so "no
 * tools" and "not synced yet" are indistinguishable — wait for this if you need
 * to read the initial inventory.
 *
 * Safe to call at any time: if the backpack has already loaded, the callback
 * runs immediately.
 *
 * @param callback Runs once, when the initial state arrives.
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onBackpackLoaded(callback: () => void) {
	return backpackLoaded[0](callback);
}

// ====================================================================

const hotbarChanged = createHook<[Map<number, ToolId | "Drag" | "Empty">]>();

subscribe(getClientHotbar, (value, old) => {
	if (value === old) return;

	// Cloned: the listeners must not mutate the live hotbar map.
	hotbarChanged[1](table.clone(value));
});

/**
 * Runs whenever the hotbar arrangement changes.
 *
 * The map passed in is a copy — mutating it will not affect the real hotbar.
 * For "which tool moved where", prefer `onSlotChanged`.
 *
 * @param callback Receives the new hotbar, keyed by slot number (1-indexed).
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onHotbarChanged(callback: (hotbar: Map<number, ToolId | "Drag" | "Empty">) => void) {
	return hotbarChanged[0](callback);
}

// ====================================================================

/** Where a tool sits: a hotbar slot number, or the inventory overflow. */
type SlotLocation = number | "Inventory";

const slotChanged = createHook<[ToolId, SlotLocation, SlotLocation]>();

/** Hotbar slot holding the tool, or undefined if it isn't in the hotbar. */
function hotbarSlotOf(hotbar: Map<number, ToolId | "Drag" | "Empty">, toolId: ToolId) {
	for (const [slot, id] of hotbar) {
		if (id === toolId) return slot;
	}
}

// Derived from the hotbar signal rather than fired from tools.ts: every path
// that moves a tool (swapSlots, swapSlotsHotbar, dragTool, undragTool) writes
// through setClientHotbar, so one diff here covers them all.
subscribe(getClientHotbar, (value, old) => {
	if (value === old) return;

	// Tools mentioned in either map. "Drag"/"Empty" are excluded: mid-drag the
	// source slot holds the "Drag" sentinel, and reporting that as a move would
	// fire a spurious event on pickup and again on drop.
	const seen = new Set<ToolId>();
	for (const [, id] of old) if (id !== "Drag" && id !== "Empty") seen.add(id);
	for (const [, id] of value) if (id !== "Drag" && id !== "Empty") seen.add(id);

	for (const toolId of seen) {
		const from = hotbarSlotOf(old, toolId);
		const to = hotbarSlotOf(value, toolId);

		if (from === to) continue;

		// A tool absent from the hotbar is in the inventory — but only report that
		// if it still exists; a removed tool is onToolRemoved's business, not a move.
		if (from === undefined && !getClientBackpackOrder().includes(toolId)) continue;
		if (to === undefined && !getClientBackpackOrder().includes(toolId)) continue;

		slotChanged[1](toolId, from ?? "Inventory", to ?? "Inventory");
	}
});

/**
 * Runs when a tool moves between slots — hotbar to hotbar, hotbar to inventory,
 * or inventory to hotbar.
 *
 * `from` and `to` are a hotbar slot number (1-indexed) or `"Inventory"` for the
 * overflow. A drag reports one move when it lands, not one on pickup; a
 * cancelled drag reports nothing. Tools being added to or removed from the
 * backpack entirely are `onToolAdded` / `onToolRemoved`, not a move.
 *
 * @param callback Receives the tool and where it moved from/to.
 * @returns Cleanup function to remove the listener.
 * @client
 */
export function onSlotChanged(callback: (toolId: ToolId, from: SlotLocation, to: SlotLocation) => void) {
	return slotChanged[0](callback);
}
