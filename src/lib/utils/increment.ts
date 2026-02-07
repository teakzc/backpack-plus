let counter = 0;

/**
 * Generate a unique number
 *
 * @returns A number that is always incremented
 *
 * @hidden
 */
export function getCount(): number {
	counter += 1;
	return counter;
}
