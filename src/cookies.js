function stripLeadingDot(domain) {
	return domain.startsWith(".") ? domain.slice(1) : domain;
}

function uniqueBy(items, keyFn) {
	const seen = new Set();
	return items.filter((item) => {
		const key = keyFn(item);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

export function buildQueryUrls(domain) {
	const host = stripLeadingDot(domain);
	const schemes = ["https://", "http://"];
	const urls = new Set();

	schemes.forEach((scheme) => {
		urls.add(`${scheme}${host}/`);
		if (!host.startsWith("www.")) {
			urls.add(`${scheme}www.${host}/`);
		}
	});

	return Array.from(urls);
}

function getCookiesForUrl(url) {
	return new Promise((resolve) => {
		chrome.cookies.getAll({ url }, (cookies) => resolve(cookies || []));
	});
}

export async function getCookiesForDomain(domain) {
	const urls = buildQueryUrls(domain);
	const results = await Promise.all(urls.map(getCookiesForUrl));
	const flattened = results.flat();

	return uniqueBy(
		flattened,
		(cookie) => `${cookie.name}|${cookie.domain}|${cookie.path}|${cookie.storeId}`
	);
}

export function buildRemovalUrls(cookie) {
	const host = stripLeadingDot(cookie.domain);
	const schemes = cookie.secure ? ["https://"] : ["https://", "http://"];
	return schemes.map((scheme) => `${scheme}${host}${cookie.path}`);
}

async function removeCookie(cookie) {
	const urls = buildRemovalUrls(cookie);
	const removals = await Promise.all(
		urls.map(
			(url) =>
				new Promise((resolve) => {
					chrome.cookies.remove(
						{ url, name: cookie.name, storeId: cookie.storeId },
						(details) => resolve(details)
					);
				})
		)
	);

	return removals.some(Boolean);
}

export async function clearCookiesForDomains(domains) {
	const results = [];

	for (const domain of domains) {
		const cookies = await getCookiesForDomain(domain);
		const removals = await Promise.all(cookies.map(removeCookie));
		const removedCount = removals.filter(Boolean).length;

		results.push({
			domain,
			cookieCount: cookies.length,
			removedCount,
			failedCount: cookies.length - removedCount,
		});
	}

	return results;
}
