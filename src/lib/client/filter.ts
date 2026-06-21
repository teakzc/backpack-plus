import { set } from "@rbxts/sift/out/Dictionary";
import { BackpackFilterFn, filterAtom } from "./atoms";

export function addFilter<T = Record<string, unknown>>(key: string, filter: BackpackFilterFn<T>) {
	filterAtom((current) => set(current, key, filter));
}

export function removeFilter(key: string) {
	filterAtom((current) => set(current, key, undefined));
}

export function getFilter(key: string) {
	return filterAtom().get(key);
}

export function clearFilter() {
	filterAtom(new Map<string, BackpackFilterFn>());
}
