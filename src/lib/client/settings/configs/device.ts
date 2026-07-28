import { viewportXSettingModule } from "@/client/settings/configs/viewport";
import { SettingModule } from "@/client/settings/types";
import { computed } from "@rbxts/charm";
import { GuiService, UserInputService } from "@rbxts/services";

export const deviceSettingModule: SettingModule<"device"> = {
	key: "device",
	atom: computed(() => {
		const isMobile = UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled;
		const isConsole = GuiService.IsTenFootInterface();
		const isTablet = isMobile && viewportXSettingModule.atom() > 1024;

		if (isConsole) return "console";
		if (isTablet) return "tablet";
		if (isMobile) return "phone";

		return "desktop";
	}),
};
