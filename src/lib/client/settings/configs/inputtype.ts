import { atom } from "@rbxts/charm";
import { RunService, UserInputService } from "@rbxts/services";
import { SettingModule } from "@/client/settings/types";

function getInputType() {
	if (!RunService.IsRunning()) return "default";

	return UserInputService.PreferredInput === Enum.PreferredInput.Gamepad ? "gamepad" : "default";
}

/**
 * Tracks whether the player is on gamepad or keyboard/mouse.
 * @hidden
 * @client
 */
export const inputTypeSettingModule: SettingModule<"inputType"> = {
	key: "inputType",
	atom: atom(getInputType()),
	source: (write) => {
		UserInputService.GetPropertyChangedSignal("PreferredInput").Connect(() => write(getInputType()));
	},
};
