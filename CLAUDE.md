# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # compile TypeScript → Lua via rbxtsc
npm run watch        # compile in watch mode (rbxtsc -w)
npm run dev          # compile as a game place, watch mode
npx eslint src/      # lint — currently broken, see note below
```

> **Known gap:** `npx eslint src/` fails outright (`eslint.config.js` not found). `package.json` pins ESLint 9, but the repo still ships the legacy `.eslintrc` format, which ESLint 9 can't read without a compat shim. Needs either a flat-config migration or a pin back to ESLint 8 before lint is usable again.

There is no automated test suite. Development and verification happen inside Roblox Studio: build, sync with Rojo (`default.project.json`), then play.

- **UI-Labs storybook** — `src/tests/storybook/` (`backpack.storybook.ts` plus `*.story.tsx`) is the component dev loop.
- **Runtime harnesses** — `src/tests/client/runtime.client.tsx` and `src/tests/server/runtime.server.ts` are demo entry points that exercise the library end to end. They are harnesses, not assertions.

## Architecture

**backpack-plus** (`@rbxts/backpack-plus`, v2.0.0-rc.1) is a published npm package that replaces the default Roblox inventory/backpack UI. It compiles TypeScript to Lua via roblox-ts and runs inside Roblox. Inspired by `ryanlua/satchel`.

### Module layout

```
src/lib/
├── client/
│   ├── core.ts         # initializeBackpackClient() — syncer, observer, input wiring (idempotent)
│   ├── charm.ts        # Charm signals: getClientBackpack/setClientBackpack, getClientEquipped (computed), getClientHotbar, getClientBackpackOrder, getDraggingState, getInventoryVisibility, getBackpackSelection, getBackpackFilters, getConsoleSwap
│   ├── icon.ts         # TopBarPlus inventory topbar icon, bound to the togglekey setting
│   ├── inputs/         # keyboard.ts (0–9 equip), console.ts (L1/R1 cycling), gamepad.ts (B/X + focus helpers), index.ts barrel
│   ├── settings/       # setting modules (configs/: device, viewport, slots, dimensions, inputtype, togglekey), types.ts (SettingModule), index.ts assembles getBackpackSettings
│   ├── tools.ts        # dragTool(), undragTool(), swapSlots(), swapSlotsHotbar(), equipTool(), getTool(), cancelDrag(), findTool* helpers
│   ├── filter.ts       # addFilter(), removeFilter(), getFilter(), clearFilter()
│   ├── hooks.ts        # onToolEquipped/Unequipped, onToolAdded/Removed, onInventoryToggled, onBackpackLoaded, onHotbarChanged, onSlotChanged
│   ├── networking.luau / networking.d.ts  # Zap-generated client remotes (SyncState, RequestState, RequestEquip)
│   ├── decorating/     # Plugin-style UI extension points (see "Decorating" below)
│   │   ├── slot.ts         # registerSlotDecorator(), SlotDecorator, ToolContext
│   │   ├── hotbar.ts       # registerHotbarDecorator(), HotbarDecorator
│   │   ├── inventory.tsx   # registerInventoryDecorator(), InventoryDecorator, default header/search
│   │   └── draggingslot.ts # dragging-slot decorators
│   └── ui/
│       ├── App.tsx     # BackpackPlusApp — StrictMode + ErrorBoundary, mounts Hotbar/Inventory/DraggingSlot
│       ├── components/  # hotbar/, inventory/, slot/, searchbox, styleprovider
│       ├── error/       # errorboundary.tsx, errorhandler.tsx
│       └── hooks/       # useStyle, useTags
├── server/
│   ├── core.ts         # initializeBackpackServer() — charm-sync server + equip handling
│   ├── charm.ts        # getClientBackpacks / setClientBackpacks (source of truth)
│   ├── clients.ts      # registerPlayer(), unregisterPlayer(), modifyPlayer(), getBackpack(), getClientOwnership()
│   ├── tools.ts        # giveTool(), removeTool(), updateTool(), holdTool(), getTool()
│   ├── hooks.ts        # onToolEquipped(), onToolUnequipped()
│   ├── data.ts         # toolMap, toolClientMap, toolRegistry (server-only tool bookkeeping)
│   └── networking.luau / networking.d.ts  # Zap-generated server remotes
└── shared/
    ├── types.ts        # ToolPlus, ToolId, ClientBackpack, ClientBackpacks, SyncBackpackGetter, BackpackNormalizedGetter
    └── utils/
        ├── id.ts        # generateId() — counter-based unique IDs
        └── fuzzyscore.luau / .d.ts  # fuzzy search scoring helper
```

### State: Charm signals, not atoms

State lives in `client/charm.ts` and `server/charm.ts` as **Charm v11 `signal()` pairs**, not `atom()`. Each signal destructures into a getter and a setter, both exported:

```ts
const [clientHotbar, updateClientHotbar] = signal(new Map<number, ToolId | "Drag" | "Empty">());
export const getClientHotbar = clientHotbar;
export const setClientHotbar = updateClientHotbar;
```

So the convention throughout is `getX()` to read and `setX(value | updater)` to write — there is no `xAtom` symbol anywhere. Setters accept either a new value or an updater function receiving the current one.

The one exception is `client/settings/`, which still uses `Atom` internally (`SettingModule.atom`) and exposes the assembled result through the `computed` getter `getBackpackSettings()`.

### State flow

- **Server** owns `getClientBackpacks()` — a `Map<playerName, ClientBackpack>` where `ClientBackpack = { equip: ToolId; backpack: Map<ToolId, ToolPlus> }`. Tools are added/removed server-side via `giveTool` / `removeTool` / `updateTool`. The server also keeps `toolMap` / `toolClientMap` / `toolRegistry` (in `server/data.ts`) for the actual `Tool` instances.
- **charm-sync** (`@rbxts/charm-sync`) replicates to clients. Narrowing happens at *subscription* time, not send time: on `RequestState`, the server calls `server.addSignalsToClient(client, { [`backpackplus-${client.Name}`]: computed(...) })`, so each client's syncer only ever observes its own slice. `normalizePayload` (`server/core.ts`) then rewrites the per-client key `backpackplus-<Name>` down to the flat key `backpackplus` before firing, which is why client and server use two payload types — `SyncBackpackGetter` (keyed) and `BackpackNormalizedGetter` (flat).
- **Client** registers `client.addSignals({ backpackplus: setClientBackpack })` and patches arriving payloads. `observe` (in `observeBackpack`) assigns arriving tools to `getClientHotbar()` (`Map<slot, ToolId|"Drag"|"Empty">`) or `getClientBackpackOrder()` (overflow array).
- **Equip** is request/response: client calls `equipTool` → `RequestEquip.fire(toolId)`; server toggles `equip` and calls `holdTool` to parent the `Tool` to the character (or back to `backpackplus-storage`).
- **UI** (React + `@rbxts/react-charm`) reads signals reactively via `useSignalState`. `getDraggingState()` tracks in-flight drag state, `getInventoryVisibility()` toggles the inventory panel, `getBackpackSelection()` tracks the slot hovered during a drag, and `getConsoleSwap()` holds the "picked up" source during a gamepad A-button swap.

Both sync callbacks currently cast through `as never` with a `// Fix types later D:` comment — the payload types don't line up with charm-sync's generics yet.

### Networking (Zap, not remo)

Remotes are **generated by [Zap](https://github.com/red-blox/zap)** from `src/networking.zap` and committed as `networking.luau` + `networking.d.ts` on both client and server (the old `@rbxts/remo` setup is gone). They communicate over a `backpack-plus_ZAP_REMOTES` folder in `ReplicatedStorage`. The exposed events are `SyncState` (server→client state sync), `RequestState` (client→server hydrate request), and `RequestEquip` (client→server equip toggle). Do not hand-edit the generated `.luau`/`.d.ts` — edit `src/networking.zap` and regenerate.

### Decorating (extension API)

The UI exposes plugin-style decorator registries so consumers can inject custom elements without forking:

- `registerSlotDecorator(fn)` — renders per slot; receives `(tool, ToolContext)` where `ToolContext` carries `location`, `equipped`, `dragged`, `hovered` (a `React.Binding<boolean>`).
- `registerHotbarDecorator(fn)` — renders extra elements in the hotbar frame.
- `registerInventoryDecorator(region, fn)` — `region` is `"header" | "absolute" | "footer"`; `InventoryContext` provides `setQuery` / `query`. The default header (title + search box) is itself a registered decorator and can be overridden.
- Dragging-slot decorators live in `decorating/draggingslot.ts`.

Each `register*` returns a cleanup function that removes the decorator.

### Filtering

`client/filter.ts` wraps the `getBackpackFilters()` signal, a `Map<string, BackpackFilterFn>`. `addFilter(key, fn)` registers a predicate and returns a cleanup function; `removeFilter(key)` / `getFilter(key)` / `clearFilter()` round it out. `BackpackFilterFn<T>` is `(metadata: T) => boolean` and is declared in `client/charm.ts`. The inventory grid applies every registered predicate to each tool's `metadata` (`ui/components/inventory/utils.ts`).

### Hooks (event API)

`client/hooks.ts` and `server/hooks.ts` expose one-shot/repeating event subscriptions built on a shared internal `createHook`/`createLatchHook` factory (listeners are a `Set`, iterated over a copy so a listener can register/unregister mid-fire; a `pcall` around each listener means one bad callback can't break the others). All return a cleanup function.

- **Client:** `onToolEquipped` / `onToolUnequipped` (fire on sync arrival, not on the optimistic local call), `onToolAdded` / `onToolRemoved`, `onInventoryToggled`, `onHotbarChanged` (receives a cloned map), `onSlotChanged` (derived from the hotbar signal, reports one move per drag landing), `onBackpackLoaded` (latched — fires immediately if the initial sync already happened).
- **Server:** `onToolEquipped` / `onToolUnequipped`, fired from `initializeBackpackServer`'s equip handler after validation passes.
- `initializeBackpackClient` cancels any in-flight drag (`cancelDrag()`) on `Players.PlayerRemoving` for the local player, so `onHotbarChanged`'s last event before teardown is always a clean arrangement rather than a stranded `"Drag"` placeholder.

### Public API surface

- `src/lib/index.ts` re-exports `shared/types` only.
- `src/lib/client/index.ts` re-exports `charm`, `core`, `decorating`, `filter`, `hooks`, `settings`, `tools`, `ui/App`.
- `src/lib/server/index.ts` re-exports `charm`, `clients`, `core`, `hooks`, `tools`.

Because `client/charm.ts` is exported wholesale, the sync-layer setters (`setClientBackpack`, `setBackpackFilters`, `setConsoleSwap`, …) are public even though they are internal in spirit. Prefer the server tool APIs and `filter.ts` helpers over writing signals directly.

### Key design constraints

- `clientHotbar` is 1-indexed (slots 1–10). Because it is a `Map`, slot numbers map directly to UI positions with no index shift — iterate it without subtracting 1.
- `generateId()` is a global counter mod 2³² stringified, not a UUID. IDs are unique per server session, not globally.
- Phones default to 6 hotbar slots; other devices default to 10 (`slots` setting module, derived from the `device` module).
- The inventory is toggled through the TopBarPlus topbar icon; its toggle key comes from the `togglekey` setting (default `` ` ``). Keys 0–9 equip hotbar slots. On gamepad: L1/R1 cycle the equipped tool, A picks up/swaps slots inside the inventory, X moves a hotbar tool to the inventory, B cancels a pickup or closes the inventory.
- Held `Tool` instances are tagged `backpack-<PlayerName>` (CollectionService) and parked in a `backpackplus-storage` folder in `ReplicatedStorage` when not equipped.
- Hotbar slot buttons are tagged `backpack-HotbarSlotButton` / `backpack-SlotButton` so gamepad focus helpers can find them.

### Tech stack

| Concern          | Library                                               |
| ---------------- | ----------------------------------------------------- |
| UI framework     | `@rbxts/react` + `@rbxts/react-roblox`                |
| Reactive state   | `@rbxts/charm` v11 (signal, computed, effect, observe) |
| React ↔ Charm    | `@rbxts/react-charm` (`useSignalState`)               |
| State sync       | `@rbxts/charm-sync` (server/client syncer)            |
| Networking       | Zap (generated `networking.luau` + `.d.ts`)           |
| React hooks      | `@rbxts/pretty-react-hooks`                           |
| Animations       | `@rbxts/react-ripple` / `@rbxts/ripple`               |
| Topbar icon      | `@rbxts/topbarplus`                                   |
| Functional utils | `@rbxts/sift` (Dictionary.set, Array.removeValue/set) |
| Storybook        | `@rbxts/ui-labs` (dev only)                           |
| Compiler         | `roblox-ts` 3.x → Lua                                 |

## Code style

- Prettier: 4-space tab width, tabs (not spaces), 120 char print width, trailing commas. `prettier-plugin-organize-imports` sorts imports.
- ESLint extends `@teakzc/eslint-config` (roblox-ts based).
- Use `table.clone()` for shallow-copying Roblox Maps before mutation (Lua semantics — Maps are reference types). Sift's `set` returns a new map/array and is preferred for signal updates; `set(map, key, undefined)` removes a key.
- Avoid JavaScript-only APIs: `Array.from()`, `Object.keys/values/entries()`, `for...in`, `string[index]`, `.charAt()`. Use roblox-ts equivalents or Sift utilities instead.
- `@hidden` JSDoc marks internal symbols that should not appear in the published API; `@client` / `@server` mark the realm a symbol belongs to.
- No `print` in library code paths outside the single load banner in `client/core.ts`.

## MCP Tools: code intelligence

This project is indexed by two knowledge-graph MCP servers. **Prefer them over Grep/Glob/Read for exploration** — they are faster, cheaper, and give structural context (callers, dependents, impact).

- **codegraph** — `codegraph_explore` is the primary tool: one call returns verbatim source of relevant symbols grouped by file. Also `codegraph_search`, `codegraph_callers`, `codegraph_callees`, `codegraph_impact`, `codegraph_files`.
- **code-review-graph** — use `detect_changes` + `get_review_context` for code review, `get_impact_radius` / `get_affected_flows` for blast radius, `query_graph` for callers/callees/imports/tests.

Fall back to Grep/Glob/Read only when the graph doesn't cover what you need.
