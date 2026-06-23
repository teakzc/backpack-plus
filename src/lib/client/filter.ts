import { set } from "@rbxts/sift/out/Dictionary";
import { BackpackFilterFn, filterAtom } from "./atoms";

/**
 * Adds a filter function to the `filterAtom`.
 *
 * @param key The identifier.
 * @param filter The filter to set.
 * @returns Cleanup function to remove filter.
 * @client
 */
export function addFilter<T = Record<string, unknown>>(key: string, filter: BackpackFilterFn<T>) {
	filterAtom((current) => set(current, key, filter));

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
	filterAtom((current) => set(current, key, undefined));
}

/**
 * Returns the filter function from the key.
 * @param key Filter function identifier.
 * @returns `BackpackFilterFn`
 * @client
 */
export function getFilter(key: string) {
	return filterAtom().get(key);
}

/**
 * @client
 */
export function clearFilter() {
	filterAtom(new Map<string, BackpackFilterFn>());
}
