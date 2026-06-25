import { Atom, computed, effect } from "@rbxts/charm";
import { deviceSettingModule } from "./configs/device";
import { dimensionsSettingModule } from "./configs/dimensions";
import { inputTypeSettingModule } from "./configs/inputtype";
import { slotSettingModule } from "./configs/slots";
import { viewportXSettingModule } from "./configs/viewport";
import { BackpackSettingsValues, SettingModule } from "./types";

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

const modules = [deviceSettingModule, viewportXSettingModule, slotSettingModule, dimensionsSettingModule, inputTypeSettingModule] as const;

for (const module of modules) build(module as AnySettingModule);

export const backpackSettingsAtom = computed(() => {
	const settings = {} as BackpackSettingsValues;
	for (const module of modules) {
		(settings as Record<string, unknown>)[module.key] = module.atom();
	}
	return settings;
});
