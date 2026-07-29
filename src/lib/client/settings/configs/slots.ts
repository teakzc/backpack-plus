import { getBackpackSelection, setBackpackSelection, setClientBackpackOrder, setClientHotbar } from "@/client/charm";
import { deviceSettingModule } from "@/client/settings/configs/device";
import { SettingModule } from "@/client/settings/types";
import { ToolId } from "@/shared/types";
import { computed, untracked } from "@rbxts/charm";

/**
 * Hotbar slot count — 6 on phones, 10 elsewhere. Reconciles the hotbar on change.
 * @hidden
 * @client
 */
export const slotSettingModule: SettingModule<"slots"> = {
	key: "slots",
	atom: computed(() => (deviceSettingModule.atom() === "phone" ? 6 : 10)),
	effect: (slots) => {
		// Reconcile clientHotbar against the new slot count. Tools in slots that
		// no longer exist are collected (ascending slot order) so they can be
		// moved to the front of the inventory overflow.
		const removed: Array<[number, ToolId]> = [];

		setClientHotbar((current) => {
			const clone = table.clone(current);
			let changed = false;

			// Shrink: remove out-of-range slots, keeping their tool ids.
			for (const [slot, id] of clone) {
				if (slot > slots) {
					// "Empty" and "Drag" placeholders are dropped, not moved.
					if (id !== "Empty" && id !== "Drag") removed.push([slot, id]);
					clone.delete(slot);
					changed = true;
				}
			}

			// Grow/fill: ensure every in-range slot exists.
			for (let i = 1; i <= slots; i++) {
				if (!clone.has(i)) {
					clone.set(i, "Empty");
					changed = true;
				}
			}

			// Return the original when nothing moved: charm compares by reference, so
			// handing back an identical-but-new Map still counts as a change and would
			// wake every hotbar subscriber.
			return changed ? clone : current;
		});

		// A hover/selection pointing at a slot that just disappeared would otherwise
		// outlive it, and a drop (undragTool) would write the tool into a slot the
		// hotbar no longer lays out — stranding it outside both hotbar and inventory.
		const selection = untracked(getBackpackSelection);
		if (typeIs(selection, "number") && selection > slots) setBackpackSelection(undefined);

		if (removed.size() > 0) {
			// Sort ascending by slot so removed tools read left-to-right (e.g. 7→10).
			removed.sort((a, b) => a[0] < b[0]);

			const movedIds = removed.map(([, id]) => id);
			setClientBackpackOrder((current) => [...movedIds, ...current]);
		}
	},
};
