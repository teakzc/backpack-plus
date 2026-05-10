import { UserInputService } from "@rbxts/services";

export interface BackpackSettings {
	slots: number;
}

export const defaultSettings: BackpackSettings = {
	slots: UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled ? 6 : 10,
};

export let backpackSettings: BackpackSettings = defaultSettings;

export function applySettings(settings: Partial<BackpackSettings>) {
	backpackSettings = {
		...backpackSettings,
		...settings,
	};
}
