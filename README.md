<div align="center">

  <img src="https://raw.githubusercontent.com/teakzc/backpack-plus/refs/heads/main/logo.png" alt="questionable artwork" width="256" height="256"/>

  <h1 align="center"><b>backpack-plus</b></h1>
  <p align="center"></p>

    A modern Roblox backpack UI & custom server-side made /w React & inspired by ryanlua/satchel

[![License](https://img.shields.io/github/license/teakzc/backpack-plus?style=for-the-badge)](https://github.com/teakzc/backpack-plus/blob/main/LICENSE)

</div>

## 🎒 What can backpack-plus do?

- Provide a better alternative to Roblox's inventory UI
- Easy customization with stylesheets and decorating with React components
- Easily manage backpack states with `littensy/charm`
- Attach metadata to tools for querying and used for custom decorating.
- Inventory querying system that works with metadata, using fuzzy searching
- Automatic server to client replication using `charm-sync`

Backpack-plus does not just replace the CoreGui backpack, but also the server side. Instead of raw `Tool` instances, backpack-plus provides API to add, modify and remove tools and handling everything for you.

## 💎 Credits

- ryanlua/satchel for the backpack dimension calculations 🙏

## 📦 Installation

[npm](https://www.npmjs.com/package/@rbxts/backpack-plus):

```zsh
npm add @rbxts/backpack-plus
```

### Main Dependancies

- littensy/charm
- littensy/rbxts-react
- littensy/ripple

## 🗃️ Documentation

### ⚡️ Quick Start

Check out the demo in `src/tests`, compile with --type game (Also contains jest testings)

Start by setting up the server by registing clients

```ts
import { Players } from "@rbxts/services";
import { register_client, remove_client, initialize_backpack_server } from "backpack-plus";

initialize_backpack_server();

Players.PlayerAdded.Connect((client) => {
	register_client(client); // Sets up the backpack and replication
});

Players.PlayerRemoving.Connect((client) => {
	remove_client(client);
});
```

Now also make sure you initialize the client!

```ts
import { initialize_backpack } from "backpack-plus";

initialize_backpack({
    /**
     * You can customize the inventory here, and change it via customize_backpack()
     */
});

mount_component(<SomeReactComponentIWantOnMyInventoryButNotTheToolbar />, "inventory"); // Mounts a react component to the inventory

const ui_container = new Instance("ScreenGui");
ui_container.Parent = Players.LocalPlayer?.WaitForChild("PlayerGui");

const root = createRoot(ui_container);

render_backpack(root); // Render the backpack

initialize_inputs(); // Helper function that detects keys 0-9 and opening/closing of the inventory
```

Lets give the player some tools now

```ts
import { add_tool, remove_tool } from "backpack-plus";

const toolID = add_tool(client, {
	name: "Murasama",
	tooltip: "There will be blood!",
	metadata: {
		// Useful for filtering between what type of tools you want to display
		// For example: weapons, loot, chests etc.
		type: "sword",
		rarity: "epic",
	},
	tool: ReplicatedStorage.Assets.Murasama, // To be cloned and given to the player
});

// Maybe we should remove the tool now?
remove_tool(client, toolID);
```

What about adding filters to the inventory?

```ts
import { clear_filters, add_filter, filterList } from "backpack-plus";

add_filter((tool) => tool.metadata.type === "sword"); // I only want to see swords

clear_filters(); // Nevermind

// Or directly manipulate the filter atom

filterList((current) => {
	// Do something with it!
});
```

How do you preserve the toolbar arrangement?

Note: If you want to preserve the arrangement you should provide `id` from the source of truth's tool when adding tools

```ts
import { on_tool_move } from "backpack-plus

function where(id: string, arrangement) {
    // search through and find
    return location
}

// type idArrangement = {
// 	toolbar: Map<string, number>;
// 	inventory: string[];
// };

on_tool_move((client, arrangement: idArrangement) => {
    // Apply updates to the real inventory

    for (const tool of realInventory) {
        // save this to datastore of the arrangement
        const position = where(tool.Id, arrangement) as number | string

        if (position === undefined) continue

        tool.Position = position
    }
})
```

Now we can apply them next time they join the game.

```ts
import { add_tool } from "backpack-plus";

for (const tool of realInventory) {
	add_tool(
		client,
		{
			name: tool.Name,
			tooltip: tool.Tooltip,
			tool: tool.Tool,
		},
		tool.Position,
	);
}
```
