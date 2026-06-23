import { atom } from "@rbxts/charm";
import React from "@rbxts/react";
import { ToolPlus } from "../../shared/types";

/**
 * Context provided to `DraggingSlotDecorator`.
 * @client
 */
export interface DraggingContext {
	/**
	 * From where the tool was dragged from. Number means that it was dragged from that hotbar slot.
	 */
	from: number | "Inventory";

	/**
	 * If the dragged tool is also equipped.
	 */
	equipped: boolean;
}

/**
 * @client
 */
export type DraggingSlotDecorator = (tool: ToolPlus, ctx: DraggingContext) => React.Element | undefined;

/**
 * Atom holding an array of `DraggingSlotDecorator`.
 * @client
 */
export const draggingSlotDecoratorsAtom = atom<DraggingSlotDecorator[]>([]);

/**
 * Register a `DraggingSlotDecorator` and returns a cleanup function.
 * @param decorator The decorator function to add to the array.
 * @returns Cleanup function to remove decorator.
 * @client
 */
export function registerDraggingSlotDecorator(decorator: DraggingSlotDecorator) {
	draggingSlotDecoratorsAtom((current) => [...current, decorator]);
	return () => draggingSlotDecoratorsAtom((current) => current.filter((d) => d !== decorator));
}
