import { atom } from "@rbxts/charm";
import { SettingModule } from "@/client/settings/types";

export const togglekeySettingModule: SettingModule<"togglekey"> = {
	key: "togglekey",
	atom: atom<Enum.KeyCode>(Enum.KeyCode.Backquote),
};
