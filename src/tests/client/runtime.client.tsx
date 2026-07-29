import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players, UserInputService } from "@rbxts/services";
import { initializeBackpackClient } from "@/client/core";
import { addFilter, removeFilter } from "@/client/filter";
import {
	onBackpackLoaded,
	onHotbarChanged,
	onInventoryToggled,
	onSlotChanged,
	onToolAdded,
	onToolEquipped,
	onToolRemoved,
	onToolUnequipped,
} from "@/client/hooks";
import { BackpackPlusApp } from "@/client/ui/App";

type ToolMetadata = { lvl?: number; type?: string };

/** Test-only filters: mock predicates over the seed metadata from runtime.server.ts. */
const mockFilters: Record<string, (metadata: ToolMetadata) => boolean> = {
	weaponsOnly: (metadata) => metadata.type === "weapon",
	lvl10Plus: (metadata) => (metadata.lvl ?? 0) >= 10,
};

/** F: toggle "weapons only", G: toggle "lvl >= 10" — both stack via addFilter's keying. */
const activeMockFilters = new Set<string>();
function toggleMockFilter(key: keyof typeof mockFilters) {
	if (activeMockFilters.has(key)) {
		removeFilter(key);
		activeMockFilters.delete(key);
		log("filter", `${key} off`);
	} else {
		addFilter(key, mockFilters[key]);
		activeMockFilters.add(key);
		log("filter", `${key} on`);
	}
}

UserInputService.InputBegan.Connect((input, gpe) => {
	if (gpe) return;
	if (input.KeyCode === Enum.KeyCode.F) toggleMockFilter("weaponsOnly");
	else if (input.KeyCode === Enum.KeyCode.G) toggleMockFilter("lvl10Plus");
});

/** Prints a hotbar map as `1=id 2=Empty ...`, skipping empty slots. */
function formatHotbar(hotbar: Map<number, string>) {
	const parts: string[] = [];
	for (const [slot, id] of hotbar) {
		if (id !== "Empty") parts.push(`${slot}=${id}`);
	}

	table.sort(parts);
	return parts.size() > 0 ? parts.join(" ") : "(empty)";
}

function log(hook: string, detail?: string) {
	print(`[hooks] ${hook}${detail !== undefined ? ` — ${detail}` : ""}`);
}

// Registered before initializeBackpackClient so the latch is exercised for real:
// register after init and it takes the already-fired path instead.
onBackpackLoaded(() => log("onBackpackLoaded", "initial state synced"));

onToolAdded((toolId) => log("onToolAdded", toolId));
onToolRemoved((toolId) => log("onToolRemoved", toolId));

onToolEquipped((toolId) => log("onToolEquipped", toolId));
onToolUnequipped((toolId) => log("onToolUnequipped", toolId));

onSlotChanged((toolId, from, to) => log("onSlotChanged", `${toolId}: ${from} -> ${to}`));
onHotbarChanged((hotbar) => log("onHotbarChanged", formatHotbar(hotbar)));

onInventoryToggled((visible) => log("onInventoryToggled", visible ? "open" : "closed"));

// Late registration: must run immediately rather than wait for an event that
// already happened. Silence here means the latch is broken.
onBackpackLoaded(() => log("onBackpackLoaded", "late registration fired immediately"));

// Cleanup must actually unregister — this listener should never print.
const cleanup = onToolAdded(() => log("onToolAdded", "LEAKED: cleaned-up listener still firing"));
cleanup();

// A throwing listener must not stop the ones registered after it.
onToolAdded(() => error("intentional test error — the warn above is expected"));
onToolAdded((toolId) => log("onToolAdded", `survived a throwing listener (${toolId})`));

initializeBackpackClient();

const root = createRoot(new Instance("Folder", Players.LocalPlayer.WaitForChild("PlayerGui")));
root.render(createPortal(<BackpackPlusApp />, Players.LocalPlayer.WaitForChild("PlayerGui")));
