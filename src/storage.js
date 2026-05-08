const STORAGE_KEY = "websites";

function storageGet(key) {
	return new Promise((resolve) => {
		chrome.storage.local.get([key], (result) => resolve(result));
	});
}

function storageSet(value) {
	return new Promise((resolve) => {
		chrome.storage.local.set(value, () => resolve());
	});
}

function normalizeWebsiteList(value) {
	if (!Array.isArray(value)) {
		return [];
	}

	return [...new Set(value.filter((entry) => typeof entry === "string"))];
}

export async function getWebsites() {
	const result = await storageGet(STORAGE_KEY);
	return normalizeWebsiteList(result[STORAGE_KEY]);
}

export async function setWebsites(websites) {
	const normalized = normalizeWebsiteList(websites);
	await storageSet({ [STORAGE_KEY]: normalized });
	return normalized;
}

export async function addWebsite(website) {
	const websites = await getWebsites();
	if (!websites.includes(website)) {
		websites.push(website);
	}

	return setWebsites(websites);
}

export async function removeWebsite(website) {
	const websites = await getWebsites();
	return setWebsites(websites.filter((entry) => entry !== website));
}

export async function migrateLegacyWebsites(legacyStorage) {
	if (!legacyStorage || typeof legacyStorage.getItem !== "function") {
		return false;
	}

	const raw = legacyStorage.getItem(STORAGE_KEY);
	if (!raw) {
		return false;
	}

	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		return false;
	}

	const normalized = normalizeWebsiteList(parsed);
	if (normalized.length === 0) {
		return false;
	}

	await setWebsites(normalized);
	if (typeof legacyStorage.removeItem === "function") {
		legacyStorage.removeItem(STORAGE_KEY);
	}

	return true;
}
