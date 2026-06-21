import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useRef } from "@rbxts/react";
import { BACKPACK_DIMENSIONS } from "../constants";

interface InventorySearchBoxProps {
	onQuery: (query: string) => void;
	placeholder?: string | React.Binding<string>;
	alignment?: Enum.TextXAlignment;
}

export default function InventorySearchBox(props: InventorySearchBoxProps) {
	const { INVENTORY_HEADER_SIZE, SEARCH_BUFFER_PIXELS, SEARCH_WIDTH_PIXELS, SEARCH_TEXT_OFFSET } =
		BACKPACK_DIMENSIONS;

	const headerInner = INVENTORY_HEADER_SIZE - SEARCH_BUFFER_PIXELS * 2;

	const textRef = useRef<TextBox>();

	useEventListener(textRef.current?.GetPropertyChangedSignal("Text"), () => {
		props.onQuery(textRef.current?.Text ?? "");
	});

	return (
		<frame
			AnchorPoint={new Vector2(1, 0.5)}
			Position={UDim2.fromScale(1, 0.5)}
			Size={new UDim2(0, SEARCH_WIDTH_PIXELS - SEARCH_BUFFER_PIXELS * 2, 0, headerInner)}
		>
			<uistroke />
			<uicorner CornerRadius={new UDim(0, 3)} />

			<textbox
				ref={textRef}
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
