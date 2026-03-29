import { afterEach, beforeAll, describe, expect, it } from "@rbxts/jest-globals";
import {
	clear_client,
	modify_client,
	register_client,
	remove_all,
	remove_client,
	retrieve_client,
} from "../../../lib/server/clients";
import { add_tool, remove_tool } from "../../../lib/server";

beforeAll(() => {
	for (const [key] of pairs(_G)) {
		if (typeIs(key, "Instance") && key.IsA("ModuleScript")) {
			(_G as Map<unknown, unknown>).delete(key);
		}
	}
});

describe("client inventory management", () => {
	afterEach(() => {
		remove_all();
	});

	describe("register client", () => {
		it("should register client", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			expect(retrieve_client(mockClient)).toEqual({});
		});
	});

	describe("retrieve client", () => {
		it("should return nil without registering", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			expect(retrieve_client(mockClient)).toBeNil();
		});

		it("should return the client's tools", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, (current) => {
				const cloned = table.clone(current);

				cloned["123"] = {
					id: "123",
					name: "test",
					metadata: {},
				};

				return cloned;
			});

			expect(retrieve_client(mockClient)?.["123"].id).toEqual("123");
		});

		it("should not return removed tools", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, (current) => {
				const cloned = table.clone(current);

				cloned["123"] = {
					id: "123",
					metadata: {},
				};

				return cloned;
			});

			modify_client(mockClient, () => {
				return {};
			});

			expect(retrieve_client(mockClient)).toEqual({});
		});
	});

	describe("modify client", () => {
		it("should modify the inventory", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, (current) => {
				const cloned = table.clone(current);

				cloned["1"] = {
					id: "1",
					metadata: {},
				};

				return cloned;
			});

			expect(retrieve_client(mockClient)?.["1"].id).toEqual("1");

			modify_client(mockClient, (current) => {
				if (!current["1"]) return current;

				const cloned = table.clone(current);
				cloned["1"] = { ...cloned["1"], id: "100" };

				return cloned;
			});

			expect(retrieve_client(mockClient)?.["1"].id).toEqual("100");
		});

		it("should do nothing if client not registered", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			modify_client(mockClient, (current) => {
				const cloned = table.clone(current);

				cloned["1"] = {
					id: "1",
					metadata: {},
				};

				return cloned;
			});

			expect(retrieve_client(mockClient)).toBeNil();
		});
	});

	describe("clear client", () => {
		it("should clear the inventory", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, (current) => {
				const cloned = table.clone(current);

				cloned["1"] = {
					id: "1",
					metadata: {},
				};

				return cloned;
			});

			clear_client(mockClient);

			expect(retrieve_client(mockClient)).toEqual({});
		});
	});

	describe("remove client", () => {
		it("should remove the client", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			remove_client(mockClient);

			expect(retrieve_client(mockClient)).toBeNil();
		});
	});

	describe("remove all", () => {
		it("should remove all clients", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			const mockClient2 = {
				Name: "Test2",
				UserId: 12,
			} as Player;

			register_client(mockClient2);

			remove_all();

			expect(retrieve_client(mockClient)).toBeNil();

			expect(retrieve_client(mockClient2)).toBeNil();
		});
	});

	describe("add tool", () => {
		it("should add a tool to the client", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			const toolId = add_tool(mockClient, {
				name: "Hammer",
				image: "hammer.png",
				tooltip: "A useful hammer",
			});

			const tools = retrieve_client(mockClient);

			expect(tools).never.toBeNil();

			const addedTool = tools?.[toolId];
			expect(addedTool?.name).toEqual("Hammer");
			expect(addedTool?.image).toEqual("hammer.png");
			expect(addedTool?.tooltip).toEqual("A useful hammer");
			expect(addedTool?.id).toBeDefined();
		});

		it("should have seperate ids", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			const id1 = add_tool(mockClient, {
				name: "Hammer",
			});

			const id2 = add_tool(mockClient, {
				name: "Wrench",
			});

			expect(id1).never.toEqual(id2);
		});

		it("should not add tool if client not registered", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			const toolId = add_tool(mockClient, {
				name: "Hammer",
			});

			expect(toolId).toEqual("");
		});
	});

	describe("remove tool", () => {
		it("should remove a tool from the client", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			const toolId = add_tool(mockClient, {
				name: "Hammer",
			});

			remove_tool(mockClient, toolId);

			const tools = retrieve_client(mockClient);

			expect(tools?.[toolId]).toBeUndefined();
		});

		it("should not remove tool if client not registered", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			const didRemove = remove_tool(mockClient, "123");

			expect(didRemove).toBeNil();
		});

		it("should not throw and not remove a non existant tool", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			const id = add_tool(mockClient, {
				name: "Hammer",
			});

			expect(() => remove_tool(mockClient, id + "nonexistent")).never.toThrow();

			expect(retrieve_client(mockClient)?.[id]).toBeDefined();
		});
	});
});
