import { beforeAll, describe, expect, it } from "@rbxts/jest-globals";
import { createRoot } from "@rbxts/react-roblox";
import { get_visibility, mount_component, render_backpack, toggle_inventory, unmount_component } from "../../../lib";
import { mountedAtoms } from "../../../lib/client/atoms";

beforeAll(() => {
	for (const [key] of pairs(_G)) {
		if (typeIs(key, "Instance") && key.IsA("ModuleScript")) {
			(_G as Map<unknown, unknown>).delete(key);
		}
	}
});

describe("backpack rendering", () => {
	describe("creating root", () => {
		it("should return a root", () => {
			const container = new Instance("Folder");
			const root = createRoot(container);

			expect(render_backpack(root)).never.toBeNil();

			root.unmount();
		});
	});

	describe("inventory visibility", () => {
		it("should toggle states correctly", () => {
			toggle_inventory(false);

			expect(get_visibility()).toBeFalsy();
		});
	});

	describe("mounting components", () => {
		it("should mount properly", () => {
			const mockComponent = {} as React.JSX.Element;

			mount_component(mockComponent, "base");

			expect(mountedAtoms.base()).toContain(mockComponent);
		});

		it("should unmount properly", () => {
			const mockComponent = {} as React.JSX.Element;

			mount_component(mockComponent, "base");

			unmount_component(mockComponent, "base");

			expect(mountedAtoms.base()).never.toContain(mockComponent);
		});
	});
});
