import { set } from "@rbxts/sift/out/Dictionary";
import { BackcpackFilter, filterAtom } from "./atoms";

export function addFilter(key: string, filter: BackcpackFilter) {
	filterAtom((current) => set(current, key, filter));
}

export function removeFilter(key: string) {
	filterAtom((current) => set(current, key, undefined));
}

export function getFilter(key: string) {
	return filterAtom().get(key);
}

export function clearFilter() {
	filterAtom(new Map<string, BackcpackFilter>());
}
