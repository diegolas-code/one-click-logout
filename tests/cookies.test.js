import {
	buildQueryUrls,
	buildRemovalUrls,
	clearCookiesForDomains,
} from "../src/cookies.js";

describe("cookies", () => {
	test("buildQueryUrls includes www variant", () => {
		const urls = buildQueryUrls("example.com");
		expect(urls).toEqual(
			expect.arrayContaining([
				"https://example.com/",
				"http://example.com/",
				"https://www.example.com/",
				"http://www.example.com/",
			])
		);
	});

	test("buildRemovalUrls strips leading dot", () => {
		const urls = buildRemovalUrls({
			domain: ".example.com",
			path: "/",
			secure: true,
		});
		expect(urls).toEqual(["https://example.com/"]);
	});

	test("clearCookiesForDomains counts removals", async () => {
		chrome.cookies.getAll.mockImplementation((options, cb) =>
			cb([
				{
					name: "sid",
					domain: ".example.com",
					path: "/",
					secure: false,
					storeId: "0",
				},
			])
		);
		chrome.cookies.remove.mockImplementation((details, cb) =>
			cb({ name: details.name })
		);

		const results = await clearCookiesForDomains(["example.com"]);
		expect(results[0].cookieCount).toBe(1);
		expect(results[0].removedCount).toBe(1);
	});
});
