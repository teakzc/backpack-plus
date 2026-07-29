import { atom } from "@rbxts/charm";
import { SettingModule } from "@/client/settings/types";

/**
 * Key that opens and closes the inventory. Defaults to backquote.
 * @hidden
 * @client
 */
export const togglekeySettingModule: SettingModule<"togglekey"> = {
	key: "togglekey",
	atom: atom<Enum.KeyCode>(Enum.KeyCode.Backquote),
};
