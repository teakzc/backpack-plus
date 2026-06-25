import { atom } from "@rbxts/charm";
import { Workspace } from "@rbxts/services";
import { SettingModule } from "../types";

export const viewportXSettingModule: SettingModule<"viewportX"> = {
	key: "viewportX",
	atom: atom(0),
	source: (write) => {
		task.spawn(() => {
			let camera = Workspace.CurrentCamera;
			while (!camera) {
				task.wait();
				camera = Workspace.CurrentCamera;
			}

			write(camera.ViewportSize.X);
			camera.GetPropertyChangedSignal("ViewportSize").Connect(() => {
				write((camera as Camera).ViewportSize.X);
			});
		});
	},
};
