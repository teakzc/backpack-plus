import { atom } from "@rbxts/charm";
import React from "@rbxts/react";
import InventoryContent from "../ui/components/inventory/content";
import InventoryHeader from "../ui/components/inventory/header";
import InventorySearchBox from "../ui/components/searchbox";

export type InventoryRegion = "header" | "absolute" | "footer";

export interface InventoryContext {
	/** Push a search query that filters the tool grid. */
	setQuery: (query: string) => void;
	/** Current query. */
	query: string;
}

export type InventoryDecorator = (ctx: InventoryContext) => React.Element | undefined;

export const inventoryDecoratorsAtom = atom<Map<InventoryRegion, InventoryDecorator[]>>(
	new Map<InventoryRegion, InventoryDecorator[]>([
		[
			"header",
			[
				(ctx) => (
					<InventoryContent>
						<InventoryHeader text={"backpack+"} />

						<InventorySearchBox onQuery={ctx.setQuery} />
					</InventoryContent>
				),
			],
		],
		["absolute", [(ctx) => <frame Size={UDim2.fromScale(0.5, 0.5)} />]],
		["footer", [(ctx) => <frame Size={UDim2.fromScale(0.5, 0.5)} />]],
	]),
);

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
