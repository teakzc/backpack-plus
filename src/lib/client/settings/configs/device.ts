import { computed } from "@rbxts/charm";
import { GuiService, UserInputService } from "@rbxts/services";
import { SettingModule } from "@/client/settings/types";
import { viewportXSettingModule } from "@/client/settings/configs/viewport";

export const deviceSettingModule: SettingModule<"device"> = {
	key: "device",
	atom: computed(() => {
		const isMobile = UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled;
		const isConsole = GuiService.IsTenFootInterface();
		const isTablet = isMobile && viewportXSettingModule.atom() > 1024;

		print(isTablet);

		if (isConsole) return "console";
		if (isTablet) return "tablet";
		if (isMobile) return "phone";

		return "desktop";
	}),
};
