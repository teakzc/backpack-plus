import { atom } from "@rbxts/charm";
import React from "@rbxts/react";
import { ToolPlus } from "../../shared/types";

/**
 * Context provided to `SlotDecorator`.
 * @client
 */
export interface ToolContext {
	/**
	 * The location of the ToolSlot, number is the hotbar slot.
	 */
	location: number | "Inventory";

	/**
	 * If the current tool is equipped.
	 */
	equipped: boolean;

	/**
	 * If the current tool is being dragged. (Will be a `Dragged` slot.)
	 */
	dragged: boolean;

	/**
	 * If the client has their mouse hovering over the slot.
	 */
	hovered: React.Binding<boolean>;
}

/**
 * @client
 */
export type SlotDecorator = (tool: ToolPlus | undefined, ctx: ToolContext) => React.Element | undefined;

/**
 * @client
 */
export const slotDecoratorsAtom = atom<SlotDecorator[]>([]);

/**
 * Register a `SlotDecorator` and returns a cleanup function.
 *
 *
 * @param decorator The decorator function to add to the array.
 * @returns Cleanup function to remove decorator.
 * @client
 */
export function registerSlotDecorator(decorator: SlotDecorator) {
	slotDecoratorsAtom((current) => [...current, decorator]);
	return () => slotDecoratorsAtom((current) => current.filter((d) => d !== decorator));
}
