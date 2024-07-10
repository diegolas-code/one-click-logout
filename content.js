document.addEventListener("DOMContentLoaded", function () {
	const siteList = document.getElementById("site_list").querySelector("ul");
	const siteInput = document.getElementById("site");
	const addButton = document.getElementById("submit");
	const noValuesMessage = document.getElementById("noValuesMessage");
	const logoutButton = document.getElementById("logout");

	var content1 = document.getElementById("content-main");
	var content2 = document.getElementById("content-about");
	var seeMoreLink = document.getElementById("go-about");
	var goBackLink = document.getElementById("go-main");

	content2.style.display = "none"; // Hide content-about initially

	seeMoreLink.addEventListener("click", function () {
		content1.style.display = "none";
		content2.style.display = "block";
	});

	goBackLink.addEventListener("click", function () {
		content1.style.display = "block";
		content2.style.display = "none";
	});

	function saveSitesToLocalStorage() {
		const websites = Array.from(siteList.children).map((listItem) =>
			listItem.textContent.trim()
		);

		localStorage.setItem("websites", JSON.stringify(websites));
	}

	function loadSitesFromLocalStorage() {
		const storedWebsites = localStorage.getItem("websites");

		if (storedWebsites) {
			const websites = JSON.parse(storedWebsites);
			websites.forEach(appendWebsiteToList);
		}

		updateNoValuesMessageVisibility();
		updateLogoutButtonState();
	}

	function updateLogoutButtonState() {
		logoutButton.disabled = !hasStoredWebsites();
	}

	function hasStoredWebsites() {
		const storedWebsites = localStorage.getItem("websites");
		return storedWebsites && JSON.parse(storedWebsites).length > 0;
	}

	function appendWebsiteToList(website) {
		const listItem = document.createElement("li");
		listItem.textContent = website;
		siteList.appendChild(listItem);
		updateNoValuesMessageVisibility();
	}

	function addSitesToList() {
		const websites = siteInput.value.split("\n");

		websites
			.map((website) => website.trim().toLowerCase())
			.filter((website) => website !== "")
			.forEach((website) => {
				// Regular expressions for the specified patterns
				const pattern1 = /^\w+\.\w{2}$/; // xxxxx.xx
				const pattern2 = /^\w+\.\w{2}\.\w{2}$/; // xxxxx.xx.xx
				const pattern3 = /^\w+\.\w{3}$/; // xxxxx.xxx
				const pattern4 = /^\w+\.\w{3}\.\w{2}$/; // xxxxx.xxx.xx

				if (
					!pattern1.test(website) &&
					!pattern2.test(website) &&
					!pattern3.test(website) &&
					!pattern4.test(website)
				) {
					// If the input doesn't match any of the patterns, show an alert
					showNotification(
						"Input error.",
						"Please input a valid domain name."
					);
					return;
				}

				const existingIndex = Array.from(siteList.children).findIndex(
					(listItem) => listItem.textContent.trim() === website
				);

				if (existingIndex !== -1) {
					removeWebsiteFromList(siteList.children[existingIndex]);
				} else {
					appendWebsiteToList(website);
				}
			});

		saveSitesToLocalStorage();
		updateLogoutButtonState();
		siteInput.value = "";
	}

	function removeWebsiteFromList(listItem) {
		siteList.removeChild(listItem);
		saveSitesToLocalStorage();
		updateNoValuesMessageVisibility();
		updateLogoutButtonState();
	}

	function updateNoValuesMessageVisibility() {
		noValuesMessage.style.display =
			siteList.children.length === 0 ? "block" : "none";
	}

	addButton.addEventListener("click", addSitesToList);

	siteInput.addEventListener("keydown", function (event) {
		if (event.key === "Enter") {
			addSitesToList();
			event.preventDefault();
		}
	});

	document.getElementById("logout").addEventListener("click", async () => {
		await clearCookiesForSites();
		showNotification(
			"Logout Successful!",
			"All selected sessions have been closed."
		);
	});

	loadSitesFromLocalStorage();
});
