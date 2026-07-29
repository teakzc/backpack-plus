import { ToolId } from "@/shared/types";

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

/**
 * Fired by `initializeBackpackServer` when an equip request is accepted.
 * @hidden
 * @server
 */
export const toolEquipped = createHook<[ToolId]>();

/**
 * Runs when a client equips a tool, after the request passes validation.
 *
 * @param callback Receives the equipped tool.
 * @returns Cleanup function to remove the listener.
 * @server
 */
export function onToolEquipped(callback: (toolId: ToolId) => void) {
	return toolEquipped[0](callback);
}

// ====================================================================

/**
 * Fired by `initializeBackpackServer` when a client toggles its equipped tool off.
 * @hidden
 * @server
 */
export const toolUnequipped = createHook<[ToolId]>();

/**
 * Runs when a client unequips its held tool.
 *
 * @param callback Receives the tool that was unequipped.
 * @returns Cleanup function to remove the listener.
 * @server
 */
export function onToolUnequipped(callback: (toolId: ToolId) => void) {
	return toolUnequipped[0](callback);
}
