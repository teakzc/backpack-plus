import { atom } from "@rbxts/charm";
import React from "@rbxts/react";
import { ToolPlus } from "../../shared/types";

export interface ToolContext {
	location: number | "Inventory";
	equipped: boolean;
	dragged: boolean;
	hovered: React.Binding<boolean>;
}

export type SlotDecorator = (tool: ToolPlus | undefined, ctx: ToolContext) => React.Element | undefined;

export const slotDecoratorsAtom = atom<SlotDecorator[]>([]);

export function registerSlotDecorator(decorator: SlotDecorator) {
	slotDecoratorsAtom((current) => [...current, decorator]);
	return () => slotDecoratorsAtom((current) => current.filter((d) => d !== decorator));
}
