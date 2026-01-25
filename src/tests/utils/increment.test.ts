import { describe, expect, it } from "@rbxts/jest-globals";
import { getCount } from "../../lib/utils/increment";

describe("increment function", () => {
	it("should never be equal", () => {
		expect(getCount()).never.toEqual(getCount());
	});

	it("should always increment", () => {
		expect(getCount() + 1).toEqual(getCount());
	});
});
