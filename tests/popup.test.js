import { jest } from "@jest/globals";

const popupHtml = `
	<div class="head">
		<div class="image"><img src="icon.png" /></div>
		<div class="title"><h1>One Click Logout</h1></div>
	</div>
	<button id="logout">Logout</button>
	<div id="content-main">
		<div class="options">
			<h2>Websites to close session for:</h2>
			<div id="site_list"><ul></ul><p id="noValuesMessage"></p></div>
			<h3>Add website</h3>
			<input type="text" id="site" />
			<div class="add"><button id="submit">Add</button></div>
			<p id="errorMessage"></p>
		</div>
		<div class="foot"><a href="#" id="go-about">About</a></div>
	</div>
	<div id="content-about">
		<div class="options">
			<h2>About</h2>
		</div>
		<div class="foot"><a href="#" id="go-main">Go back</a></div>
	</div>
`;

describe("popup", () => {
	let popup;

	beforeEach(async () => {
		jest.resetModules();
		document.body.innerHTML = popupHtml;
		
		// Reset storage mocks
		let websites = [];
		chrome.storage.local.get.mockImplementation((keys, cb) => cb({ websites }));
		chrome.storage.local.set.mockImplementation((value, cb) => {
			if (value.websites) websites = value.websites;
			if (cb) cb();
		});
		
		chrome.permissions.contains.mockImplementation((details, cb) => cb(true));
		chrome.permissions.request.mockImplementation((details, cb) => cb(true));
		chrome.runtime.sendMessage.mockImplementation((message, cb) =>
			cb({ ok: true, result: [] })
		);

		popup = await import(`../src/popup.js?update=${Date.now()}`);
		document.dispatchEvent(new Event("DOMContentLoaded"));
		await new Promise(resolve => setTimeout(resolve, 50));
	});

	test("disables logout when no websites", async () => {
		const logoutButton = document.getElementById("logout");
		expect(logoutButton.disabled).toBe(true);
	});

	test("adds a website to the list", async () => {
		const input = document.getElementById("site");
		const submit = document.getElementById("submit");
		const list = document.querySelector("#site_list ul");

		input.value = "example.com";
		submit.click();

		// Wait for all async steps
		await new Promise(resolve => setTimeout(resolve, 100));

		expect(list.children.length).toBe(1);
		expect(list.children[0].textContent).toContain("example.com");
		
		const logoutButton = document.getElementById("logout");
		expect(logoutButton.disabled).toBe(false);
	});

	test("removes a website via delete button", async () => {
		const input = document.getElementById("site");
		const submit = document.getElementById("submit");
		const list = document.querySelector("#site_list ul");

		input.value = "example.com";
		submit.click();
		await new Promise(resolve => setTimeout(resolve, 100));

		expect(list.children.length).toBe(1);
		
		const deleteBtn = list.querySelector(".delete-btn");
		deleteBtn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));

		expect(list.children.length).toBe(0);
		
		const status = document.getElementById("errorMessage");
		expect(status.textContent).toContain("example.com removed.");
		expect(status.classList.contains("success")).toBe(true);
		
		const logoutButton = document.getElementById("logout");
		expect(logoutButton.disabled).toBe(true);
	});
});
