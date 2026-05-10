import { UserInputService } from "@rbxts/services";

export const BACKPACK_DIMENSIONS = {
	SCROLL_OFFSET: 40,
	ICON_BUFFER: 5,
	ICON_SIZE: 60,
	INVENTORY_ROWS: () => (UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled ? 2 : 4),
	INVENTORY_HEADER: 40,
	SEARCH_WIDTH_PIXELS: 200,
	SEARCH_BUFFER_PIXELS: 5,
	SEARCH_TEXT_OFFSET: 8,
	INVENTORY_HEADER_SIZE: 40,
	SLOT_EQUIP_THICKNESS: 5,
};
