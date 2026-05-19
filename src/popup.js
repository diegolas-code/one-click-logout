import {
	addWebsite,
	getWebsites,
	migrateLegacyWebsites,
	removeWebsite,
} from "./storage.js";
import { normalizeDomain } from "./validation.js";
import { sendClearCookies } from "./messaging.js";

function showNotification(title, message) {
	chrome.notifications.create({
		type: "basic",
		iconUrl: "icon.png",
		title,
		message,
	});
}

function buildHostPermissions(domain) {
	const origins = new Set();
	origins.add(`*://${domain}/*`);
	if (!domain.startsWith("www.")) {
		origins.add(`*://*.${domain}/*`);
	}

	return Array.from(origins);
}

async function ensureHostPermissions(domain) {
	const origins = buildHostPermissions(domain);
	const hasPermissions = await new Promise((resolve) => {
		chrome.permissions.contains({ origins }, resolve);
	});

	if (hasPermissions) {
		return true;
	}

	return new Promise((resolve) => {
		chrome.permissions.request({ origins }, (granted) => resolve(granted));
	});
}

function renderWebsiteList(
	listElement,
	websites,
	messageElement,
	logoutButton
) {
	listElement.innerHTML = "";
	websites.forEach((website) => {
		const listItem = document.createElement("li");

		const textSpan = document.createElement("span");
		textSpan.textContent = website;
		listItem.appendChild(textSpan);

		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "×";
		deleteBtn.className = "delete-btn";
		deleteBtn.title = `Remove ${website}`;
		deleteBtn.addEventListener("click", async () => {
			await removeWebsite(website);
			await refreshWebsites(listElement, messageElement, logoutButton);
			setStatus(`${website} removed`, "success");
		});

		listItem.appendChild(deleteBtn);
		listElement.appendChild(listItem);
	});
}

function updateNoValuesMessage(listElement, messageElement) {
	messageElement.style.display =
		listElement.children.length === 0 ? "block" : "none";
}

async function refreshWebsites(listElement, messageElement, logoutButton) {
	const websites = await getWebsites();
	renderWebsiteList(listElement, websites, messageElement, logoutButton);
	updateNoValuesMessage(listElement, messageElement);
	logoutButton.disabled = websites.length === 0;
}

async function handleAdd(listElement, messageElement, logoutButton, input) {
	const entries = input.value.split("\n");
	for (const entry of entries) {
		const normalized = normalizeDomain(entry);
		if (!normalized.ok) {
			setStatus(normalized.error, "error");
			continue;
		}

		const domain = normalized.value;
		const granted = await ensureHostPermissions(domain);
		if (!granted) {
			setStatus("Permission denied for that domain", "error");
			continue;
		}

		const current = await getWebsites();
		if (current.includes(domain)) {
			setStatus(`${domain} is already in the list`, "warning");
		} else {
			await addWebsite(domain);
			setStatus(`${domain} added`, "success");
		}
	}

	await refreshWebsites(listElement, messageElement, logoutButton);
	input.value = "";
}

async function handleLogout(logoutButton) {
	logoutButton.disabled = true;
	setStatus("Clearing cookies...", "info");
	try {
		const response = await sendClearCookies();
		if (!response?.ok) {
			throw new Error(response?.error || "Unable to clear cookies");
		}

		const results = response.result || [];
		const failed = results.filter((item) => item.failedCount > 0).length;
		if (failed > 0) {
			setStatus("Some cookies could not be removed", "warning");
			showNotification(
				"Logout completed",
				"Some cookies could not be removed"
			);
		} else {
			setStatus("All selected sessions have been closed.", "success");
			showNotification(
				"Logout Successful!",
				"All selected sessions have been closed"
			);
		}
	} catch (error) {
		setStatus(error?.message || "Unable to clear cookies", "error");
		showNotification(
			"Logout failed",
			error?.message || "Unable to clear cookies"
		);
	} finally {
		logoutButton.disabled = false;
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	const siteList = document.getElementById("site_list").querySelector("ul");
	const siteInput = document.getElementById("site");
	const addButton = document.getElementById("submit");
	const noValuesMessage = document.getElementById("noValuesMessage");
	const logoutButton = document.getElementById("logout");

	const contentMain = document.getElementById("content-main");
	const contentAbout = document.getElementById("content-about");
	const seeMoreLink = document.getElementById("go-about");
	const goBackLink = document.getElementById("go-main");

	contentAbout.style.display = "none";
	logoutButton.disabled = true;

	seeMoreLink.addEventListener("click", (event) => {
		event.preventDefault();
		contentMain.style.display = "none";
		contentAbout.style.display = "block";
	});

	goBackLink.addEventListener("click", (event) => {
		event.preventDefault();
		contentMain.style.display = "block";
		contentAbout.style.display = "none";
	});

	await migrateLegacyWebsites(window.localStorage);
	await refreshWebsites(siteList, noValuesMessage, logoutButton);

	addButton.addEventListener("click", () =>
		handleAdd(siteList, noValuesMessage, logoutButton, siteInput)
	);

	siteInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleAdd(siteList, noValuesMessage, logoutButton, siteInput);
		}
	});

	logoutButton.addEventListener("click", () => handleLogout(logoutButton));

	setStatus("", "");
});

function setStatus(message, variant = "") {
	const status = document.getElementById("errorMessage");
	status.textContent = message;
	status.className = variant ? `status ${variant}` : "status";
}
