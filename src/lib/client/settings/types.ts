import { Atom } from "@rbxts/charm";

/**
 * Pixel dimensions the UI lays out against.
 * @hidden
 * @client
 */
export type BackpackDimensions = {
	SCROLL_OFFSET: number;
	ICON_BUFFER: number;
	ICON_SIZE: number;
	INVENTORY_ROWS: number;
	INVENTORY_HEADER: number;
	SEARCH_WIDTH_PIXELS: number;
	SEARCH_BUFFER_PIXELS: number;
	SEARCH_TEXT_OFFSET: number;
	INVENTORY_HEADER_SIZE: number;
	SLOT_EQUIP_THICKNESS: number;
	INVENTORY_ARROWS_BUFFER_VR: number;
};

/**
 * The resolved settings, as returned by `getBackpackSettings`.
 * @hidden
 * @client
 */
export type BackpackSettingsValues = {
	device: "desktop" | "phone" | "tablet" | "console";
	viewportX: number;
	slots: number;
	dimensions: BackpackDimensions;
	inputType: "default" | "gamepad";
	togglekey: Enum.KeyCode;
};

/**
 * One setting: an atom, an optional external `source` that writes into it, and an
 * optional `effect` run whenever it changes.
 * @hidden
 * @client
 */
export type SettingModule<K extends keyof BackpackSettingsValues> = {
	key: K;
	atom: Atom<BackpackSettingsValues[K]>;
	effect?: (value: BackpackSettingsValues[K]) => void;
	source?: (write: (value: BackpackSettingsValues[K]) => void) => void;
};
