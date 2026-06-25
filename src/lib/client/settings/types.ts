import { Atom } from "@rbxts/charm";

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

export type BackpackSettingsValues = {
	device: "desktop" | "phone" | "tablet" | "console";
	viewportX: number;
	slots: number;
	dimensions: BackpackDimensions;
	inputType: "default" | "gamepad";
};

export type SettingModule<K extends keyof BackpackSettingsValues> = {
	key: K;
	atom: Atom<BackpackSettingsValues[K]>;
	effect?: (value: BackpackSettingsValues[K]) => void;
	source?: (write: (value: BackpackSettingsValues[K]) => void) => void;
};
