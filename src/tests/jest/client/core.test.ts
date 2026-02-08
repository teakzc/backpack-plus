import { beforeAll, describe, it, expect, jest, beforeEach } from "@rbxts/jest-globals";
import {
	initialize_backpack,
	customize_backpack,
	find_tool,
	drag_tool,
	drop_tool,
	add_filter,
	remove_filter,
	clear_filters,
	get_dragged,
	on_dropped,
	on_dragged,
	BACKPACK_PROPERTIES,
} from "../../../lib/client/core";
import { tool } from "../../../lib/server/tools";
import {
	toolbarState,
	inventoryState,
	draggingState,
	backpackSelectionState,
	filterList,
} from "../../../lib/client/atoms";

beforeAll(() => {
	for (const [key] of pairs(_G)) {
		if (typeIs(key, "Instance") && key.IsA("ModuleScript")) {
			(_G as Map<unknown, unknown>).delete(key);
		}
	}
});

const createMockTool = (id: string, name?: string): tool => ({
	id,
	name: name || `Tool${id}`,
	image: "rbxasset://textures/ui/GuiImagePlaceholder.png",
	tooltip: `Mock Tool ${id}`,
	metadata: {},
});

describe("client side backpack", () => {
	beforeEach(() => {
		toolbarState([]);
		inventoryState([]);
		draggingState(undefined);
		backpackSelectionState(undefined);
		filterList([]);
	});

	describe("initialize_backpack", () => {
		it("should initialize backpack with default values", () => {
			initialize_backpack({ TOOLBAR_AMOUNT: 5 });

			expect(BACKPACK_PROPERTIES.TOOLBAR_AMOUNT).toBe(5);
			expect(BACKPACK_PROPERTIES.MOBILE).toBe(false);
			expect(BACKPACK_PROPERTIES.BACKPACK_TEXT()).toBe("Backpack");

			const toolbar = toolbarState();
			expect(toolbar.size()).toBe(5);

			for (let i = 0; i < 5; i++) {
				expect(toolbar[i]).toEqual("empty");
			}
		});

		it("should initialize backpack with custom values", () => {
			const customFont = new Font("rbxasset://fonts/families/SourceSansPro.json");
			initialize_backpack({
				TOOLBAR_AMOUNT: 8,

				BACKPACK_FONT: customFont,
				BACKPACK_TEXT: "Custom Pack",
			});

			expect(BACKPACK_PROPERTIES.TOOLBAR_AMOUNT).toBe(8);
			expect(BACKPACK_PROPERTIES.MOBILE).toBe(true);
			expect(BACKPACK_PROPERTIES.BACKPACK_FONT).toBe(customFont);
			expect(BACKPACK_PROPERTIES.BACKPACK_TEXT()).toBe("Custom Pack");
		});
	});

	describe("customize_backpack", () => {
		it("should update backpack properties", () => {
			initialize_backpack({ TOOLBAR_AMOUNT: 5 });

			customize_backpack({
				TOOLBAR_AMOUNT: 12,
			});

			expect(BACKPACK_PROPERTIES.TOOLBAR_AMOUNT).toBe(12);
			expect(BACKPACK_PROPERTIES.MOBILE).toBe(true);
		});
	});

	describe("find_tool", () => {
		it("should find tool in toolbar", () => {
			const mockTool = createMockTool("1");
			const mockTool2 = createMockTool("2");
			toolbarState(["empty", mockTool2, mockTool]);

			const location = find_tool(mockTool);
			expect(location).toBe("toolbar");
		});

		it("should find tool in backpack", () => {
			const mockTool = createMockTool("1");
			const mockTool2 = createMockTool("2");
			inventoryState([mockTool2, mockTool]);

			const location = find_tool(mockTool);
			expect(location).toBe("backpack");
		});

		it("should return undefined if tool not found", () => {
			const mockTool = createMockTool("1");

			const location = find_tool(mockTool);
			expect(location).toBeUndefined();
		});
	});

	describe("drag_tool", () => {
		it("should drag tool from toolbar", () => {
			const mockTool = createMockTool("1");
			toolbarState(["empty", mockTool, "empty"]);

			drag_tool(mockTool);

			const dragging = get_dragged();
			if (dragging) {
				expect(dragging.tool.id).toBe(mockTool.id);
				expect(dragging.from).toBe("toolbar");
				expect(dragging.index).toBe(1);
			}
			expect(toolbarState()[1]).toBe("drag");
		});

		it("should drag tool from backpack", () => {
			const mockTool = createMockTool("1");
			const mockTool2 = createMockTool("2");
			inventoryState([mockTool2, mockTool]);

			drag_tool(mockTool);

			const dragging = get_dragged();
			if (dragging) {
				expect(dragging.tool.id).toBe(mockTool.id);
				expect(dragging.from).toBe("backpack");
			}
			expect(inventoryState()[1]).toBe("drag");
		});

		it("should not drag tool if not found", () => {
			const mockTool = createMockTool("1");

			drag_tool(mockTool);

			expect(get_dragged()).toBeUndefined();
		});
	});

	describe("drop_tool", () => {
		it("should return tool to original location when cancelled", () => {
			const mockTool = createMockTool("1");
			draggingState({
				tool: mockTool,
				from: "toolbar",
				offset: Vector2.zero,
				index: 1,
			});
			backpackSelectionState(undefined);
			toolbarState(["empty", "drag", "empty"]);

			drop_tool();

			expect(toolbarState()[1]).toBe(mockTool);
			expect(get_dragged()).toBeUndefined();
		});

		it("should move tool from toolbar to backpack", () => {
			const mockTool = createMockTool("1");
			draggingState({
				tool: mockTool,
				from: "toolbar",
				offset: Vector2.zero,
				index: 1,
			});
			backpackSelectionState("backpack");
			toolbarState(["empty", "drag", "empty"]);

			drop_tool();

			const backpack = inventoryState();
			let found = false;
			for (const item of backpack) {
				if (item !== "drag" && item.id === mockTool.id) {
					found = true;
					break;
				}
			}
			expect(found).toBe(true);
			expect(toolbarState()[1]).toBe("empty");
			expect(get_dragged()).toBeUndefined();
		});

		it("should swap tools in toolbar", () => {
			const mockTool = createMockTool("1");
			const mockTool2 = createMockTool("2");
			draggingState({
				tool: mockTool,
				from: "toolbar",
				offset: Vector2.zero,
				index: 1,
			});
			backpackSelectionState(2);
			toolbarState(["empty", "drag", mockTool2]);

			drop_tool();

			expect(toolbarState()[1]).toEqual(mockTool2);
			expect(toolbarState()[2]).toEqual(mockTool);
			expect(get_dragged()).toBeUndefined();
		});
	});

	describe("filter functionality", () => {
		it("should add filter", () => {
			const filter = (tool: tool) => tool.name === "";

			add_filter(filter);

			const filters = filterList();
			expect(filters.size()).toBe(1);
			expect(filters[0]).toBe(filter);
		});

		it("should remove filter", () => {
			const filter = (tool: tool) => tool.name === "";
			add_filter(filter);

			remove_filter(filter);

			const filters = filterList();
			expect(filters.size()).toBe(0);
		});

		it("should clear all filters", () => {
			add_filter((tool: tool) => tool.name === "");
			add_filter((tool: tool) => tool.name !== undefined);

			clear_filters();

			const filters = filterList();
			expect(filters.size()).toBe(0);
		});
	});

	describe("callback functions", () => {
		it("should register and call on_dropped callback", () => {
			const mockTool = createMockTool("1");
			const callback = jest.fn();

			const clean = on_dropped(mockTool, callback);

			toolbarState((current) => [...current, mockTool]);

			draggingState({
				tool: mockTool,
				from: "toolbar",
				offset: Vector2.zero,
				index: 1,
			});

			drag_tool(mockTool);

			drop_tool();

			expect(callback).toHaveBeenCalled();

			clean();
		});

		it("should register and call on_dragged callback", () => {
			const mockTool = createMockTool("1");
			const callback = jest.fn();

			const clean = on_dragged(mockTool, callback);

			toolbarState([mockTool]);
			drag_tool(mockTool);

			expect(callback).toHaveBeenCalled();

			clean();
		});
	});

	describe("getter functions", () => {
		it("should get currently dragged tool", () => {
			const mockTool = createMockTool("1");
			draggingState({
				tool: mockTool,
				from: "toolbar",
				offset: Vector2.zero,
				index: 1,
			});

			const dragged = get_dragged();
			expect(dragged?.tool.id).toBe(mockTool.id);
		});
	});
});
