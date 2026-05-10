import {
	addWebsite,
	getWebsites,
	migrateLegacyWebsites,
	removeWebsite,
	setWebsites,
} from "../src/storage.js";
import { jest } from "@jest/globals";

describe("storage", () => {
	test("getWebsites returns empty list when missing", async () => {
		chrome.storage.local.get.mockImplementation((keys, cb) => cb({}));
		await expect(getWebsites()).resolves.toEqual([]);
	});

	test("setWebsites normalizes entries", async () => {
		chrome.storage.local.set.mockImplementation((value, cb) => cb());
		await setWebsites(["one.com", 1, "one.com"]);
		expect(chrome.storage.local.set).toHaveBeenCalledWith(
			{ websites: ["one.com"] },
			expect.any(Function)
		);
	});

	test("addWebsite and removeWebsite update stored list", async () => {
		chrome.storage.local.get.mockImplementation((keys, cb) =>
			cb({ websites: ["one.com"] })
		);
		chrome.storage.local.set.mockImplementation((value, cb) => cb());

		await addWebsite("two.com");
		expect(chrome.storage.local.set).toHaveBeenCalledWith(
			{ websites: ["one.com", "two.com"] },
			expect.any(Function)
		);

		chrome.storage.local.get.mockImplementation((keys, cb) =>
			cb({ websites: ["one.com", "two.com"] })
		);
		await removeWebsite("one.com");
		expect(chrome.storage.local.set).toHaveBeenCalledWith(
			{ websites: ["two.com"] },
			expect.any(Function)
		);
	});

	test("migrateLegacyWebsites moves data", async () => {
		const legacyStorage = {
			getItem: jest.fn(() => JSON.stringify(["example.com"])),
			removeItem: jest.fn(),
		};
		chrome.storage.local.set.mockImplementation((value, cb) => cb());

		const migrated = await migrateLegacyWebsites(legacyStorage);
		expect(migrated).toBe(true);
		expect(chrome.storage.local.set).toHaveBeenCalledWith(
			{ websites: ["example.com"] },
			expect.any(Function)
		);
		expect(legacyStorage.removeItem).toHaveBeenCalledWith("websites");
	});
});
