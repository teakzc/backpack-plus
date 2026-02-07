
<div align="center">

  <img src="https://raw.githubusercontent.com/teakzc/backpack-plus/refs/heads/main/logo.png" alt="questionable artwork" width="256" height="256"/>

  <h1 align="center"><b>backpack-plus</b></h1>
  <p align="center"></p>

    A modern Roblox backpack made /w React & inspired by ryanlua/satchel

  [![License](https://img.shields.io/github/license/teakzc/backpack-plus?style=for-the-badge)](https://github.com/teakzc/backpack-plus/blob/main/LICENSE)
</div>

[npm package](https://www.npmjs.com/package/@rbxts/backpack-plus)

## 🎒 What can backpack-plus do?
- Provide a better alternative to Roblox's inventory
- Easy customization by mounting in react components
- Easily manage player's inventory states by using `atom`s from littensy/charm
- Attach metadata to `tool`s
- Inventory filtering system that compliments `tool` metadata + fuzzy searching
- Listen to what the player does (Mouse hover selection, tool dragging & others)
- Automatic server to client replication using `charm-sync`

## 💎 Credits
- ryanlua/satchel for the backpack dimension calculations 🙏

## 📦 Installation
[npm](https://www.npmjs.com/package/@rbxts/backpack-plus):
```zsh
npm add @rbxts/backpack-plus
```

### Main Dependancies
- 1ForeverHD/TopbarPlus
- littensy/charm
- littensy/remo
- littensy/rbxts-react
- littensy/ripple

## Quick side note

This is my first actual actual package so I hope it is not badly written, and if so don't hesitate to give any criticism. I will be using this for all my games so any bugs will be squashed immediantly too.

## 🗃️ Documentation

### ⚡️ Quick Start

Check out the demo in `src/tests`, compile with --type game (Also contains jest testings)

Start by setting up the server by registing clients

```ts
import { Players } from "@rbxts/services";
import { register_client, remove_client } from "backpack-plus";

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
import { add_tool, remove_tool } from "backpack-plus"

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
import { clear_filters, add_filter, filterList } from "backpack-plus"

add_filter((tool) => tool.metadata.type === "sword"); // I only want to see swords

clear_filters(); // Nevermind

// Or directly manipulate the filter atom

filterList((current) => {
    // Do something with it!
})
```