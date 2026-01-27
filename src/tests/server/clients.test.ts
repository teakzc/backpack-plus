import { afterEach, describe, expect, it } from "@rbxts/jest-globals";
import {
	clear_client,
	modify_client,
	register_client,
	remove_all,
	remove_client,
	retrieve_client,
} from "../../lib/server/clients";

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

			expect(retrieve_client(mockClient)).toEqual([]);
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

				cloned.push({
					id: 123,
					name: "test"
				});

				return cloned;
			});

			expect(retrieve_client(mockClient)?.[0].id).toEqual(123);
		});

		it("should not return removed tools", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, (current) => {
				const cloned = table.clone(current);

				cloned.push({
					id: 123,
				});

				return cloned;
			});

			modify_client(mockClient, () => {
				return [];
			});

			expect(retrieve_client(mockClient)).toEqual([]);
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

				cloned.push({
					id: 1,
				});

				return cloned;
			});

			expect(retrieve_client(mockClient)?.[0].id).toEqual(1);

			modify_client(mockClient, (current) => {
				if (!current[0]) return current;

				const cloned = table.clone(current);
				cloned[0].id = 100;

				return cloned;
			});

			expect(retrieve_client(mockClient)?.[0].id).toEqual(100);
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

				cloned.push({
					id: 1,
				});

				return cloned;
			});

			clear_client(mockClient);

			expect(retrieve_client(mockClient)).toEqual([]);
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
});
