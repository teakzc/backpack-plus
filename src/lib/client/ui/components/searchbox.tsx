import { getBackpackSettings } from "@/client/settings";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { useSignalState } from "@rbxts/react-charm";

interface BackpackPlusInventorySearchBoxProps {
	onQuery: (query: string) => void;
	placeholder?: string | React.Binding<string>;
	alignment?: Enum.TextXAlignment;
}

/**
 * @hidden
 */
export default function BackpackPlusInventorySearchBox(props: BackpackPlusInventorySearchBoxProps) {
	const { INVENTORY_HEADER_SIZE, SEARCH_BUFFER_PIXELS, SEARCH_WIDTH_PIXELS, SEARCH_TEXT_OFFSET } = useSignalState(
		() => getBackpackSettings().dimensions,
	);

	const inputType = useSignalState(() => getBackpackSettings().inputType);

	const headerInner = INVENTORY_HEADER_SIZE - SEARCH_BUFFER_PIXELS * 2;

	const [textBox, setTextBox] = useState<TextBox>();

	useEventListener(textBox?.GetPropertyChangedSignal("Text"), () => {
		props.onQuery(textBox?.Text ?? "");
	});

	// Clear any leftover search when switching to gamepad, so the grid isn't
	// left filtered by a query the player can no longer edit.
	useEffect(() => {
		if (inputType === "gamepad") props.onQuery("");
	}, [inputType]);

	// No text entry on console — hide the search box entirely on gamepad.
	if (inputType === "gamepad") return undefined;

	return (
		<frame
			AnchorPoint={new Vector2(1, 0.5)}
			Position={UDim2.fromScale(1, 0.5)}
			Size={new UDim2(0, SEARCH_WIDTH_PIXELS - SEARCH_BUFFER_PIXELS * 2, 0, headerInner)}
		>
			<uistroke />
			<uicorner CornerRadius={new UDim(0, 3)} />

			<textbox
				ref={setTextBox}
				AnchorPoint={new Vector2(0, 0.5)}
				PlaceholderText={props.placeholder ?? "Search"}
				Text={""}
				TextXAlignment={props.alignment ?? Enum.TextXAlignment.Left}
				Position={new UDim2(0, SEARCH_TEXT_OFFSET, 0.5, 0)}
				Size={
					new UDim2(
						0,
						SEARCH_WIDTH_PIXELS - SEARCH_BUFFER_PIXELS * 2 - SEARCH_TEXT_OFFSET * 2 - 20,
						0,
						headerInner - SEARCH_TEXT_OFFSET * 2,
					)
				}
			></textbox>
		</frame>
	);
}
