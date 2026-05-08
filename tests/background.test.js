import { createClearCookiesHandler } from "../src/background.js";

describe("background handler", () => {
	test("createClearCookiesHandler uses injected dependencies", async () => {
		const getWebsitesFn = jest.fn().mockResolvedValue(["example.com"]);
		const clearCookiesFn = jest.fn().mockResolvedValue([{ domain: "example.com" }]);
		const handler = createClearCookiesHandler({ getWebsitesFn, clearCookiesFn });

		const result = await handler();
		expect(result).toEqual([{ domain: "example.com" }]);
		expect(getWebsitesFn).toHaveBeenCalled();
		expect(clearCookiesFn).toHaveBeenCalledWith(["example.com"]);
	});
});
