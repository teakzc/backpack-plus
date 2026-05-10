let id = 0;

/**
 * Generates a unique ID
 * @returns A unique ID
 */
export function generateId() {
	id++;
	id %= 2 ** 32;
	return tostring(id);
}
