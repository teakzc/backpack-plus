import { Atom, computed, effect } from "@rbxts/charm";
import { deviceSettingModule } from "@/client/settings/configs/device";
import { dimensionsSettingModule } from "@/client/settings/configs/dimensions";
import { inputTypeSettingModule } from "@/client/settings/configs/inputtype";
import { slotSettingModule } from "@/client/settings/configs/slots";
import { togglekeySettingModule } from "@/client/settings/configs/togglekey";
import { viewportXSettingModule } from "@/client/settings/configs/viewport";
import { BackpackSettingsValues, SettingModule } from "@/client/settings/types";

type AnySettingModule = SettingModule<keyof BackpackSettingsValues>;

function build(module: AnySettingModule) {
	const atom = module.atom as Atom<BackpackSettingsValues[keyof BackpackSettingsValues]>;

	const moduleSource = module.source;
	if (moduleSource !== undefined) {
		task.spawn(() => {
			moduleSource((value) => atom(value));
		});
	}

	const moduleEffect = module.effect;
	if (moduleEffect !== undefined) {
		effect(() => moduleEffect(atom()));
	}
}

const modules = [
	deviceSettingModule,
	viewportXSettingModule,
	slotSettingModule,
	dimensionsSettingModule,
	inputTypeSettingModule,
	togglekeySettingModule,
] as const;

for (const module of modules) build(module as AnySettingModule);

/**
 * Reads the assembled backpack settings — device, viewport, slots, dimensions,
 * input type, and toggle key.
 * @client
 */
export const getBackpackSettings = computed(() => {
	const settings = {} as BackpackSettingsValues;
	for (const module of modules) {
		(settings as Record<string, unknown>)[module.key] = module.atom();
	}
	return settings;
});
