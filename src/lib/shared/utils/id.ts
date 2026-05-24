const MAX_ID = 2 ** 32;

let id = 0;

/**
 * Generates a unique ID
 * @returns A unique ID
 */
export function generateId() {
	id++;
	id %= MAX_ID;
	return tostring(id);
}
