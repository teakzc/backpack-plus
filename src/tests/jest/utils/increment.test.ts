import { beforeAll, describe, expect, it } from "@rbxts/jest-globals";
import { getId } from "../../../lib/utils/increment";

beforeAll(() => {
	for (const [key] of pairs(_G)) {
		if (typeIs(key, "Instance") && key.IsA("ModuleScript")) {
			(_G as Map<unknown, unknown>).delete(key);
		}
	}
});

describe("increment function", () => {
	it("should never be equal", () => {
		expect(getId()).never.toEqual(getId());
	});
});
