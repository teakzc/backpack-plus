import { computed } from "@rbxts/charm";
import { GuiService, UserInputService } from "@rbxts/services";
import { SettingModule } from "../types";
import { viewportXSettingModule } from "./viewport";

function getDevice() {
	const isMobile = UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled;
	const isConsole = GuiService.IsTenFootInterface();
	const isTablet = isMobile && viewportXSettingModule.atom() > 1024;

	if (isConsole) return "console";
	if (isTablet) return "tablet";
	if (isMobile) return "phone";

	return "desktop";
}

export const deviceSettingModule: SettingModule<"device"> = {
	key: "device",
	atom: computed(getDevice),
};
