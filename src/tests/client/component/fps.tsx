import React, { useState } from "@rbxts/react";
import { TextLabel } from "../../../lib/client/ui/core/text";
import { useEventListener, useInterval } from "@rbxts/pretty-react-hooks";
import { RunService } from "@rbxts/services";
import { useAtom } from "@rbxts/react-charm";
import { inventoryVisibilityState } from "../../../lib";

export function FPSBAR() {
	const [fps, setFps] = useState(0);
	const [count, setCount] = useState(0);
	const [increment, setIncrement] = useState(0);

	const visibility = useAtom(() => inventoryVisibilityState());

	useEventListener(RunService.Heartbeat, (dT) => {
		setIncrement(increment + dT);

		setCount(count + 1);
		setFps(fps + 1 / dT);

		if (increment >= 0.5) {
			setIncrement(0);
			setFps(0);
			setCount(0);
		}
	});

	return (
		<TextLabel
			size={UDim2.fromOffset(512, 64)}
			position={UDim2.fromScale(0.5, visibility ? -4.5 : 0)}
			anchorPoint={new Vector2(0.5, 1)}
			text={tostring(math.round(fps / count))}
		/>
	);
}
