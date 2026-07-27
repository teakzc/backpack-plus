import { set } from "@rbxts/sift/out/Dictionary";
import { BackpackFilterFn, getBackpackFilters, setBackpackFilters } from "@/client/charm";

/**
 * Adds a filter function to the `filterAtom`.
 *
 * @param key The identifier.
 * @param filter The filter to set.
 * @returns Cleanup function to remove filter.
 * @client
 */
export function addFilter<T = Record<string, unknown>>(key: string, filter: BackpackFilterFn<T>) {
	setBackpackFilters((current) => set(current, key, filter));

	return () => {
		removeFilter(key);
	};
}

/**
 * Removes a filter from the `filterAtom`.
 * @param key The filter's identifier.
 * @client
 */
export function removeFilter(key: string) {
	setBackpackFilters((current) => set(current, key, undefined));
}

/**
 * Returns the filter function from the key.
 * @param key Filter function identifier.
 * @returns `BackpackFilterFn`
 * @client
 */
export function getFilter(key: string) {
	return getBackpackFilters().get(key);
}

/**
 * @client
 */
export function clearFilter() {
	setBackpackFilters(new Map<string, BackpackFilterFn>());
}
