# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # compile TypeScript → Lua via rbxtsc
npm run watch        # compile in watch mode
npx eslint src/      # lint
```

There are no automated test scripts — tests run inside Roblox Studio using the compiled output from `default.project.json`.

To test: build the project, sync with Rojo into a Roblox Studio place using `default.project.json`, then play the game. The client test script is at `src/tests/client/runtime.client.tsx` and the server test script is at `src/tests/server/runtime.server.ts`.

## Architecture

**backpack-plus** is a published npm package (`@rbxts/backpack-plus`) that replaces the default Roblox inventory/backpack UI. It compiles TypeScript to Lua via roblox-ts and runs inside Roblox.

### Module layout

```
src/lib/
├── client/          # Client-side state and UI
│   ├── core.ts      # initializeBackpackClient(), configureBackpack(), backpackInputHelper()
│   ├── atoms.ts     # All Charm atoms (reactive state)
│   ├── settings.ts  # BackpackSettings atom (slots count)
│   ├── tools.ts     # dragTool(), undragTool(), swapSlots(), findTool()
│   └── ui/
│       ├── App.tsx  # Root React component — mounts Hotbar, Inventory, DraggingSlot
│       ├── constants.ts  # BACKPACK_DIMENSIONS layout constants
│       ├── components/   # Hotbar, Inventory, Slot, DraggingSlot
│       └── hooks/        # useStyle, useTags
├── server/
│   ├── core.ts      # initializeBackpackServer() — charm-sync server setup
│   ├── atoms.ts     # clientBackpacks atom (source of truth)
│   ├── clients.ts   # registerPlayer(), unregisterPlayer(), modifyPlayer()
│   └── tools.ts     # giveTool(), removeTool(), updateTool()
└── shared/
    ├── types.ts     # ToolPlus, ToolId, ClientBackpack, ClientBackpacks
    ├── networking.ts # backpackRemotes (remo) + backpackSyncPayload type
    └── utils/id.ts  # generateId() — counter-based unique IDs
```

### State flow

- **Server** owns `clientBackpacks` atom (a `Map<playerName, Map<toolId, ToolPlus>>`). Tools are added/removed server-side via `giveTool` / `removeTool`.
- **charm-sync** (`@rbxts/charm-sync`) replicates the server atom to clients via `backpackRemotes.syncState`. Each client only receives its own slice (filtered in `filterPayload`).
- **Client** mirrors its slice in `_clientBackpacks`, derives `clientBackpack` (computed atom for local player), and uses `observe` to assign arriving tools to `clientHotbar` (Map<slot, ToolId|"Drag"|"Empty">) or `clientBackpackOrder` (overflow array).
- **UI** (React + `@rbxts/react-charm`) reads these atoms reactively. `draggingAtom` tracks in-flight drag state; `inventoryVisibleAtom` toggles the inventory panel; `backpackSelectionAtom` tracks which slot the user is hovering during a drag.

### Key design constraints

- `clientHotbar` is 1-indexed (slots 1–10). When iterating the hotbar map, slot numbers directly correspond to UI positions with no index shift.
- `generateId()` is a simple global counter mod 2³², not UUID. IDs are unique per server session, not globally unique.
- RSML stylesheets (`base.rbxm`, `tokens.rbxm`) are binary assets committed to `src/lib/client/ui/`. The client init code attaches them to the `StyleDerive` and `StyleSheet` instances at runtime.
- Touch devices default to 6 hotbar slots; keyboard devices default to 10 (set in `defaultSettings`).
- The backtick key (`` ` ``) toggles inventory visibility (`backpackInputHelper`).

### Tech stack

| Concern | Library |
|---|---|
| UI framework | `@rbxts/react` + `@rbxts/react-roblox` |
| Reactive state | `@rbxts/charm` (atoms, computed, observe) |
| React ↔ Charm | `@rbxts/react-charm` (`useAtom`) |
| State sync | `@rbxts/charm-sync` (server/client syncer) |
| Networking | `@rbxts/remo` (`createRemotes`) |
| Animations | `@rbxts/ripple` + `@rbxts/react-ripple` (`useSpring`) |
| Fuzzy search | `@rbxts/fuzzy-search` |
| Functional utils | `@rbxts/sift` (Dictionary.set, Array.removeValue) |
| Compiler | `roblox-ts` → Lua |

## Code style

- Prettier: 4-space tab width, tabs (not spaces), 120 char print width, trailing commas.
- ESLint extends `roblox-ts/recommended-legacy`. `roblox-ts/no-any` and `roblox-ts/lua-truthiness` are disabled.
- Use `table.clone()` for shallow-copying Roblox Maps before mutation (Lua semantics — Maps are reference types).
- Avoid JavaScript-only APIs: `Array.from()`, `Object.keys/values/entries()`, `for...in`, `string[index]`, `.charAt()`. Use roblox-ts equivalents or Sift utilities instead.
