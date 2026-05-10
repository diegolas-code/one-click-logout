import { normalizeDomain } from "../src/validation.js";

describe("normalizeDomain", () => {
	test("accepts simple domains", () => {
		expect(normalizeDomain("example.com").ok).toBe(true);
	});

	test("accepts URLs with paths", () => {
		const result = normalizeDomain("https://Sub.Example.co.uk/path");
		expect(result.ok).toBe(true);
		expect(result.value).toBe("sub.example.co.uk");
	});

	test("rejects invalid domains", () => {
		const result = normalizeDomain("not a domain");
		expect(result.ok).toBe(false);
	});
});
