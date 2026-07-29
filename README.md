<div align="center">

  <img src="https://raw.githubusercontent.com/teakzc/backpack-plus/refs/heads/main/logo.png" alt="questionable artwork" width="256" height="256"/>

  <h1 align="center"><b>backpack-plus</b></h1>
  <p align="center"></p>

    A modern Roblox backpack UI made /w React & custom server-side, inspired by ryanlua/satchel

[![License](https://img.shields.io/github/license/teakzc/backpack-plus?style=for-the-badge)](https://github.com/teakzc/backpack-plus/blob/main/LICENSE)

</div>

## 🎒 What can backpack-plus do?

- Provide a better alternative to Roblox's inventory UI
- Easy customization with stylesheets and decorating with React components
- Easily manage backpack states with `littensy/charm`
- Attach metadata to tools for querying and used for custom decorating.
- Inventory querying system that works with metadata, using fuzzy searching
- Automatic server to client replication using `charm-sync`
- Render in custom components with decorators
- Hooks and lifecycle events

Backpack-plus replaces the CoreGui backpack, and also the server side. Instead of raw `Tool` instances, backpack-plus provides API to add, modify and remove tools and handling everything for you.

## 💎 Credits

- ryanlua/satchel for the backpack dimension calculations 🙏

## 📦 Installation

[npm](https://www.npmjs.com/package/@rbxts/backpack-plus):

```zsh
npm add @rbxts/backpack-plus
```

## ⚡ Quick Start

Client:

```ts
initializeBackpackClient();

const root = createRoot(new Instance("Folder", Players.LocalPlayer.WaitForChild("PlayerGui")));
root.render(createPortal(<BackpackPlusApp />, Players.LocalPlayer.WaitForChild("PlayerGui")));
```

Server:

```ts
initializeBackpackServer();

Players.PlayerAdded.Connect((player) => {
	registerPlayer(player);

	giveTool(player, {
		name: "Excalibur",
		tooltip: "Only for the worthy...",
		// with metadata you can filter, and read from custom components
		metadata: {
			damage: 100,
			type: "weapon",
		},
		instance: ReplicatedStorage.Assets.Excalibur,
	});
});

Players.PlayerRemoving.Connect((client) => unregisterPlayer(client));
```
