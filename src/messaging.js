export const MESSAGE_TYPES = {
	CLEAR_COOKIES: "clear-cookies",
};

export function sendMessage(message) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, (response) => {
			const error = chrome.runtime.lastError;
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(response);
		});
	});
}

export function sendClearCookies() {
	return sendMessage({ type: MESSAGE_TYPES.CLEAR_COOKIES });
}
