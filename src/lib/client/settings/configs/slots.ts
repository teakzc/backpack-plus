import { computed } from "@rbxts/charm";
import { ToolId } from "../../../shared/types";
import { clientBackpackOrder, clientHotbar } from "../../atoms";
import { SettingModule } from "../types";
import { deviceSettingModule } from "./device";

export const slotSettingModule: SettingModule<"slots"> = {
	key: "slots",
	atom: computed(() => (deviceSettingModule.atom() === "phone" ? 6 : 10)),
	effect: (slots) => {
		// Reconcile clientHotbar against the new slot count. Tools in slots that
		// no longer exist are collected (ascending slot order) so they can be
		// moved to the front of the inventory overflow.
		const removed: Array<[number, ToolId]> = [];

		clientHotbar((current) => {
			const clone = table.clone(current);

			// Shrink: remove out-of-range slots, keeping their tool ids.
			for (const [slot, id] of clone) {
				if (slot > slots) {
					// "Empty" and "Drag" placeholders are dropped, not moved.
					if (id !== "Empty" && id !== "Drag") removed.push([slot, id]);
					clone.delete(slot);
				}
			}

			// Grow/fill: ensure every in-range slot exists.
			for (let i = 1; i <= slots; i++) {
				if (!clone.has(i)) {
					clone.set(i, "Empty");
				}
			}

			return clone;
		});

		if (removed.size() > 0) {
			// Sort ascending by slot so removed tools read left-to-right (e.g. 7→10).
			removed.sort((a, b) => a[0] < b[0]);

			const movedIds = removed.map(([, id]) => id);
			clientBackpackOrder((current) => [...movedIds, ...current]);
		}
	},
};
