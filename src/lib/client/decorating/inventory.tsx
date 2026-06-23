import { atom } from "@rbxts/charm";
import React from "@rbxts/react";
import BackpackPlusInventoryContent from "../ui/components/inventory/content";
import BackpackPlusInventoryHeader from "../ui/components/inventory/header";
import BackpackPlusInventorySearchBox from "../ui/components/searchbox";

/**
 * @client
 */
export type InventoryRegion = "header" | "absolute" | "footer";

/**
 * Context provided to `InventoryDecorator`.
 * @client
 */
export interface InventoryContext {
	/**
	 * Push a search query that filters the tool grid.
	 * @param query
	 * @returns
	 */
	setQuery: (query: string) => void;

	/**
	 * The current text in the query/search bar.
	 */
	query: string;
}

/**
 * @client
 */
export type InventoryDecorator = (ctx: InventoryContext) => React.Element | undefined;

/**
 * Contains default components that can be overidden.
 * @client
 */
export const inventoryDecoratorsAtom = atom<Map<InventoryRegion, InventoryDecorator[]>>(
	new Map<InventoryRegion, InventoryDecorator[]>([
		[
			"header",
			[
				(ctx) => (
					<BackpackPlusInventoryContent>
						<BackpackPlusInventoryHeader text={"backpack+"} />

						<BackpackPlusInventorySearchBox onQuery={ctx.setQuery} />
					</BackpackPlusInventoryContent>
				),
			],
		],
	]),
);

/**
 * Register a `InventoryDecorator` and returns a cleanup function.
 *
 * "header": Above the scrollingframe
 * "absolute": Within the inventory, no uilistlayout
 * "footer": Below the scrollingframe
 *
 * @param region The location to decorate [`InventoryRegion`].
 * @param decorator The decorator function to add to the array.
 * @returns Cleanup function to remove decorator.
 * @client
 */
export function registerInventoryDecorator(region: InventoryRegion, decorator: InventoryDecorator) {
	inventoryDecoratorsAtom((current) => {
		const clone = table.clone(current);
		clone.set(region, [...(clone.get(region) ?? []), decorator]);
		return clone;
	});

	return () =>
		inventoryDecoratorsAtom((current) => {
			const clone = table.clone(current);
			clone.set(
				region,
				(clone.get(region) ?? []).filter((d) => d !== decorator),
			);
			return clone;
		});
}
