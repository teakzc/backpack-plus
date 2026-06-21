import { atom } from "@rbxts/charm";
import React from "@rbxts/react";
import { ToolPlus } from "../../shared/types";

export interface DraggingContext {
	from: number | "Backpack";
	equipped: boolean;
}

export type DraggingSlotDecorator = (tool: ToolPlus, ctx: DraggingContext) => React.Element | undefined;

export const draggingSlotDecoratorsAtom = atom<DraggingSlotDecorator[]>([]);

export function registerDraggingSlotDecorator(decorator: DraggingSlotDecorator) {
	draggingSlotDecoratorsAtom((current) => [...current, decorator]);
	return () => draggingSlotDecoratorsAtom((current) => current.filter((d) => d !== decorator));
}
