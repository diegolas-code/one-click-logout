function isValidLabel(label) {
	if (!label || label.length > 63) {
		return false;
	}

	if (!/^[a-z0-9-]+$/.test(label)) {
		return false;
	}

	return !label.startsWith("-") && !label.endsWith("-");
}

function isValidHostname(hostname) {
	const labels = hostname.split(".");
	if (labels.length < 2) {
		return false;
	}

	if (!labels.every(isValidLabel)) {
		return false;
	}

	const tld = labels[labels.length - 1];
	return tld.length >= 2;
}

export function normalizeDomain(input) {
	if (!input || typeof input !== "string") {
		return { ok: false, error: "Please enter a domain." };
	}

	const trimmed = input.trim().toLowerCase();
	if (!trimmed) {
		return { ok: false, error: "Please enter a domain." };
	}

	const hasScheme = trimmed.includes("://");
	const candidate = hasScheme ? trimmed : `https://${trimmed}`;
	let hostname;
	try {
		const parsed = new URL(candidate);
		hostname = parsed.hostname;
	} catch (error) {
		return { ok: false, error: "Please enter a valid domain." };
	}

	if (!isValidHostname(hostname)) {
		return { ok: false, error: "Please enter a valid domain." };
	}

	return { ok: true, value: hostname };
}
