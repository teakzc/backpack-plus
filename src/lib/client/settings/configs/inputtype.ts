import { atom } from "@rbxts/charm";
import { UserInputService } from "@rbxts/services";
import { SettingModule } from "../types";

function getInputType() {
	return UserInputService.GamepadEnabled ? "gamepad" : "default";
}

export const inputTypeSettingModule: SettingModule<"inputType"> = {
	key: "inputType",
	atom: atom(getInputType()),
	source: (write) => {
		UserInputService.GetPropertyChangedSignal("GamepadEnabled").Connect(() => {
			write(getInputType());
		});
	},
};
