import { computed } from "@rbxts/charm";
import { SettingModule } from "@/client/settings/types";
import { deviceSettingModule } from "@/client/settings/configs/device";

/**
 * Pixel dimensions for slot sizing, inventory rows, and search box layout.
 * @hidden
 * @client
 */
export const dimensionsSettingModule: SettingModule<"dimensions"> = {
	key: "dimensions",
	atom: computed(() => {
		const device = deviceSettingModule.atom();

		// Console (10-foot interface) uses larger icons; phone (touch-only) uses fewer inventory rows.
		const isConsole = device === "console";
		const isPhone = device === "phone";

		return {
			SCROLL_OFFSET: 40,
			ICON_BUFFER: 5,
			ICON_SIZE: isConsole ? 100 : 60,
			INVENTORY_ROWS: isPhone ? 2 : 4,
			INVENTORY_HEADER: 40,
			SEARCH_WIDTH_PIXELS: 200,
			SEARCH_BUFFER_PIXELS: 5,
			SEARCH_TEXT_OFFSET: 8,
			INVENTORY_HEADER_SIZE: 40,
			SLOT_EQUIP_THICKNESS: 5,
			INVENTORY_ARROWS_BUFFER_VR: 40,
		};
	}),
};
