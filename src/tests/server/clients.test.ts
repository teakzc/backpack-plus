import { afterEach, describe, expect, it } from "@rbxts/jest-globals";
import { clear_client, modify_client, register_client, remove_all, retrieve_client } from "../../lib/server/clients";

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
		it("should return array without register", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			expect(retrieve_client(mockClient)).toEqual([]);
		});

		it("should return the client's tools", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, [
				{
					id: 123,
				},
			]);

			expect(retrieve_client(mockClient)[0].id).toEqual(123);
		});

		it("should not return removed tools", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, [
				{
					id: 123,
				},
			]);

			modify_client(mockClient, []);

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

			modify_client(mockClient, [
				{
					id: 1,
				},
			]);

			expect(retrieve_client(mockClient)[0].id).toEqual(1);

			modify_client(mockClient, [
				{
					id: 100,
				},
			]);

			expect(retrieve_client(mockClient)[0].id).toEqual(100);
		});
	});

	describe("clear client", () => {
		it("should clear the inventory", () => {
			const mockClient = {
				Name: "Test",
				UserId: 1,
			} as Player;

			register_client(mockClient);

			modify_client(mockClient, [
				{
					id: 1,
				},
			]);

			clear_client(mockClient);

			expect(retrieve_client(mockClient)).toEqual([]);
		});
	});
});
