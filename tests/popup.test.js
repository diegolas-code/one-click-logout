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
			<h3>Add or remove websites</h3>
			<p id="errorMessage"></p>
			<input type="text" id="site" />
			<div class="add"><button id="submit">Add / Remove</button></div>
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
	beforeEach(() => {
		document.body.innerHTML = popupHtml;
		chrome.storage.local.get.mockImplementation((keys, cb) => cb({ websites: [] }));
		chrome.storage.local.set.mockImplementation((value, cb) => cb());
		chrome.permissions.contains.mockImplementation((details, cb) => cb(true));
		chrome.permissions.request.mockImplementation((details, cb) => cb(true));
		chrome.runtime.sendMessage.mockImplementation((message, cb) =>
			cb({ ok: true, result: [] })
		);
	});

	test("disables logout when no websites", async () => {
		await import("../src/popup.js");
		document.dispatchEvent(new Event("DOMContentLoaded"));

		const logoutButton = document.getElementById("logout");
		expect(logoutButton.disabled).toBe(true);
	});
});
