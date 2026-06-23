import { atom } from "@rbxts/charm";
import { UserInputService, Workspace } from "@rbxts/services";

let camera = undefined;
let timeout = 0;

while (!camera && timeout < 10) {
	camera = Workspace.CurrentCamera;
	timeout += task.wait();
}

if (camera) {
	camera.GetPropertyChangedSignal("ViewportSize").Wait();
} else {
	warn(`[backpack-plus]: CurrentCamera not found!`);
}

/**
 * love you ryanlua
 */
const HOTBAR_SLOTS_WIDTH_CUTOFF = 1024;

/**
 * @client
 */
export interface BackpackSettings {
	slots: number;
}

/**
 * @client
 */
export const backpackPlusDefaultSettings: BackpackSettings = {
	slots:
		UserInputService.TouchEnabled &&
		!UserInputService.KeyboardEnabled &&
		((camera ?? Workspace.CurrentCamera)?.ViewportSize.X ?? 0) < HOTBAR_SLOTS_WIDTH_CUTOFF
			? 6
			: 10,
};

/**
 * @client
 */
export const backpackSettingsAtom = atom(backpackPlusDefaultSettings);

/**
 * Change the backpack settings.
 *
 * Slots: Amount of slots per row and in the hotbar.
 * @client
 */
export function applySettings(settings: Partial<BackpackSettings>) {
	backpackSettingsAtom((current) => ({
		...current,
		...settings,
	}));
}
