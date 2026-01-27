import { UserInputService } from "@rbxts/services";
import { initialize_inventory, renderInventory, toggleInventory } from "../lib/client";

initialize_inventory({
	TOOLBAR_AMOUNT: 6,
	MOBILE: true,
});

renderInventory();

let state = false;

UserInputService.InputBegan.Connect((input, GPE) => {
	if (GPE) return;

	if (input.KeyCode === Enum.KeyCode.Backquote) {
		state = !state;

		toggleInventory(state);
	}
});
