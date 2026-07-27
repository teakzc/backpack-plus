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

	const cleanupUIS = UserInputService.InputChanged.Connect((input) => {
		if (
			input.UserInputType === Enum.UserInputType.MouseMovement ||
			input.UserInputType === Enum.UserInputType.Touch
		) {
			if (flag) return;

			flag = true;
			cleanup(true);
		}
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
