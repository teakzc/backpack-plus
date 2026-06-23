import { ToolId } from "../../../../shared/types";
import { FuzzyScoreSorting } from "../../../../shared/utils/fuzzyscore";
import { clientBackpack, draggingAtom, filterAtom } from "../../../atoms";

/**
 * @hidden
 * @client
 */
export function filterInventory(
	backpack: ToolId[],
	hotbarIds: Set<ToolId | "Drag" | "Empty">,
	bp: ReturnType<typeof clientBackpack>["backpack"],
	filters: ReturnType<typeof filterAtom>,
): ToolId[] {
	return backpack.filter((id) => {
		if (hotbarIds.has(id) && draggingAtom()?.id === id) return false;

		const metadata = bp.get(id)?.metadata ?? {};
		for (const [_, f] of filters) {
			if (!f(metadata)) return false;
		}
		return true;
	});
}

/**
 * @hidden
 * @client
 */
export function fuzzyFilterInventory(
	filtered: ToolId[],
	bp: ReturnType<typeof clientBackpack>["backpack"],
	query: string,
): ToolId[] {
	const names = filtered.map((id) => bp.get(id)?.name ?? id);
	return FuzzyScoreSorting(names, query, filtered)
		.filter(([score]) => score >= 0.3)
		.map(([_, id]) => id);
}
