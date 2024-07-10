function getWebsitesFromLocalStorage() {
	const storedWebsites = localStorage.getItem("websites");
	return storedWebsites ? JSON.parse(storedWebsites) : [];
}

function showNotification(title, message) {
	chrome.notifications.create({
		type: "basic",
		iconUrl: "icon.png",
		title: title,
		message: message,
	});
}

async function getCookies(url) {
	const originalDomainCookies = await getCookiesForDomain(url);

	const wwwDomain = addWwwPrefix(url);
	const wwwDomainCookies = await getCookiesForDomain(wwwDomain);

	return [...originalDomainCookies, ...wwwDomainCookies];
}

function getCookiesForDomain(url) {
	return new Promise((resolve) => {
		try {
			new URL(url);
		} catch (error) {
			console.error("Invalid URL:", url);
			resolve([]);
			return;
		}

		chrome.cookies.getAll({ url }, resolve);
	});
}

function addWwwPrefix(url) {
	const parsedUrl = new URL(url);
	return (
		parsedUrl.protocol + "//www." + parsedUrl.hostname + parsedUrl.pathname
	);
}

function removeCookie(cookie) {
	return new Promise((resolve) => {
		const { name } = cookie;
		chrome.cookies.remove({ url: getCookieUrl(cookie), name }, resolve);
	});
}

function getCookieUrl(cookie) {
	const { secure, domain, path } = cookie;
	return (secure ? "https://" : "http://") + domain + path;
}

async function clearCookiesForSites() {
	const websites = getWebsitesFromLocalStorage();

	for (const website of websites) {
		try {
			const fullUrl =
				website.startsWith("http://") || website.startsWith("https://")
					? website
					: "https://" + website;

			const cookies = await getCookies(fullUrl);

			await Promise.all(cookies.map(removeCookie));
		} catch (error) {
			console.error("Invalid URL:", website);
		}
	}
}