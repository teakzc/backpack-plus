import { BACKPACK_PROPERTIES } from "../core";

/**
 * Thank you to https://github.com/ryanlua/satchel for the dimensions for the backpack.
 * I AM GRATEFUL BEYOND WORDS
 */

/**
 * Dimensions for the inventory
 *
 * @hidden
 */
export const BACKPACK_DIMENSIONS = {
	SCROLL_OFFSET: 40,
	ICON_BUFFER: 5,
	ICON_SIZE: 60,
	INVENTORY_ROWS: () => (BACKPACK_PROPERTIES.MOBILE ? 2 : 4),
	INVENTORY_HEADER: 40,
	SEARCH_WIDTH_PIXELS: 200,
	SEARCH_BUFFER_PIXELS: 5,
	SEARCH_TEXT_OFFSET: 8,
	INVENTORY_HEADER_SIZE: 40,
};
