import { atom } from "@rbxts/charm";
import React from "@rbxts/react";

/**
 * @client
 */
export type HotbarDecorator = () => React.Element | undefined;

/**
 * Atom holding an array of `HotbarDecorator`.
 * @client
 */
export const hotbarDecoratorsAtom = atom<HotbarDecorator[]>([]);

/**
 * Register a `HotbarDecorator` and returns a cleanup function.
 * @param decorator The decorator function to add to the array.
 * @returns Cleanup function to remove decorator.
 * @client
 */
export function registerHotbarDecorator(decorator: HotbarDecorator) {
	hotbarDecoratorsAtom((current) => [...current, decorator]);
	return () => hotbarDecoratorsAtom((current) => current.filter((d) => d !== decorator));
}
