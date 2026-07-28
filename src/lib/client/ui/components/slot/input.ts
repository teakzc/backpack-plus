import { GuiService, UserInputService } from "@rbxts/services";
import { dragTool } from "@/client/tools";
import { BackpackSlotProps } from "@/client/ui/components/slot/page";

/**
 * @hidden
 * @client
 */
export function backpackSlotInputBegan(props: BackpackSlotProps, rbx: ImageButton, input: InputObject) {
	if (input.UserInputType !== Enum.UserInputType.MouseButton1 && input.UserInputType !== Enum.UserInputType.Touch)
		return;
	if (props.id === "Empty" || props.id === "Drag" || !props.visibility) return;

	let flag = false;

	// ponytail: a press only drags via movement from its own device. InputChanged is a
	// global stream, so without this a gamepad Virtual Cursor press left this connection
	// live and the first real mouse move after switching devices started a phantom drag.
	const startedWithGamepad = UserInputService.GetLastInputType() === Enum.UserInputType.Gamepad1;

	const cleanupUIS = UserInputService.InputChanged.Connect((moved) => {
		const mouse =
			input.UserInputType === Enum.UserInputType.MouseButton1 &&
			moved.UserInputType === Enum.UserInputType.MouseMovement &&
			// Virtual Cursor presses register as MouseButton1; a later real-mouse move is a
			// different device, not a continuation of this press.
			!startedWithGamepad;
		// touch drag must be the same finger that pressed
		const touch = moved.UserInputType === Enum.UserInputType.Touch && moved === input;

		if (!mouse && !touch) return;
		if (flag) return;

		flag = true;
		cleanup(true);
	});

	const cleanupDetect = rbx.MouseButton1Up.Connect(() => {
		if (flag) return;

		flag = true;
		cleanup(false);
	});

	const cleanup = (state: boolean) => {
		cleanupUIS.Disconnect();
		cleanupDetect.Disconnect();

		if (!state) return;

		const buttonPos = rbx.AbsolutePosition.sub(GuiService.GetInsetArea(Enum.ScreenInsets.None).Min);

		const buttonSize = rbx.AbsoluteSize;

		const buttonCenter = new Vector2(buttonPos.X + buttonSize.X / 2, buttonPos.Y + buttonSize.Y / 2);

		const mouse = UserInputService.GetMouseLocation();

		const mousePos = new Vector2(mouse.X, mouse.Y);
		const mouseOffset = mousePos.sub(buttonCenter);

		dragTool(props.id, mouseOffset, input);
	};
}
