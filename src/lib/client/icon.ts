import { setInventoryVisibility } from "@/client/charm";
import { getBackpackSettings } from "@/client/settings";
import { effect } from "@rbxts/charm";
import { Icon } from "@rbxts/topbarplus";

let topbarIcon: Icon | undefined;

/**
 * Creates the topbar inventory icon and wires it to inventory visibility and the
 * toggle-key setting. Idempotent.
 *
 * Constructed lazily at client init (never at module load) so requiring the client
 * tree outside a running game — e.g. UI-Labs stories — doesn't touch TopBarPlus,
 * which needs `Players.LocalPlayer`.
 * @hidden
 */
export function initializeTopbarIcon() {
	if (topbarIcon !== undefined) return topbarIcon;

	const icon = new Icon()
		.setName("Inventory")
		.setImage("rbxasset://textures/ui/TopBar/inventoryOn.png", "Selected")
		.setImage("rbxasset://textures/ui/TopBar/inventoryOff.png", "Deselected")
		.setImageScale(1)
		.setCaption("Inventory")
		.autoDeselect(false)
		.setOrder(-1);

	icon.toggled.Connect(() => setInventoryVisibility((v) => !v));

	// Keep the icon's toggle key in sync with the setting. bindToggleKey
	// accumulates keys, so the old key must be unbound when the setting changes.
	effect(() => {
		const key = getBackpackSettings().togglekey;
		icon.bindToggleKey(key);
		return () => icon.unbindToggleKey(key);
	});

	topbarIcon = icon;
	return icon;
}
