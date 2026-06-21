import { atom } from "@rbxts/charm";
import React from "@rbxts/react";

export type HotbarDecorator = () => React.Element | undefined;

export const hotbarDecoratorsAtom = atom<HotbarDecorator[]>([]);

export function registerHotbarDecorator(decorator: HotbarDecorator) {
	hotbarDecoratorsAtom((current) => [...current, decorator]);
	return () => hotbarDecoratorsAtom((current) => current.filter((d) => d !== decorator));
}
