import { getWebsites } from "./storage.js";
import { clearCookiesForDomains } from "./cookies.js";
import { MESSAGE_TYPES } from "./messaging.js";

export function createClearCookiesHandler({
	getWebsitesFn = getWebsites,
	clearCookiesFn = clearCookiesForDomains,
} = {}) {
	return async function handleClearCookies() {
		const websites = await getWebsitesFn();
		return clearCookiesFn(websites);
	};
}

export const handleClearCookies = createClearCookiesHandler();

export function registerMessageHandlers() {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (!message || message.type !== MESSAGE_TYPES.CLEAR_COOKIES) {
			return undefined;
		}

		handleClearCookies()
			.then((result) => sendResponse({ ok: true, result }))
			.catch((error) =>
				sendResponse({ ok: false, error: error?.message || "Unknown error" })
			);

		return true;
	});
}
