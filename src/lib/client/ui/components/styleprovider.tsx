import React, { useEffect } from "@rbxts/react";
import { GuiService } from "@rbxts/services";

export default function BackpackStyleProvider() {
	useEffect(() => {
		const uiFolder = script.Parent?.Parent?.Parent?.WaitForChild("ui");
		if (uiFolder === undefined) return;

		const base = uiFolder.WaitForChild("base");
		if (base === undefined) return;

		const styleDerive = base.FindFirstChildOfClass("StyleDerive");
		if (styleDerive === undefined) return;

		const tokens = uiFolder.FindFirstChild("tokens");
		if (tokens === undefined) return;

		styleDerive.StyleSheet = tokens as StyleSheet;

		tokens.SetAttribute("TextSize", GuiService.IsTenFootInterface() ? "$TextSizeBig" : "$TextSizeSmall");
	}, []);

	return <stylelink StyleSheet={script.Parent?.Parent?.WaitForChild("base") as StyleSheet} />;
}
