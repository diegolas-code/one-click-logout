# Plan: Modularize and Test One Click Logout

Refactor the extension into popup-only UI + background service worker with message passing, migrate storage to chrome.storage.local, harden cookie removal, reduce permissions, and add comprehensive unit tests (Jest) covering storage, validation, and cookie clearing behavior. This addresses runtime errors, MV3 constraints, and improves maintainability.

## Steps

* Restructure architecture: define clear modules for storage, validation, cookie operations, and messaging; ensure popup is the only UI entry point and content scripts are removed. depends on decisions below
* Update manifest: remove content script and <all_urls> injection, narrow host permissions to user-selected domains, and keep MV3 service worker with required permissions only. depends on step 1
* Implement storage module using chrome.storage.local (get/set/update), with async wrappers and schema migration from any existing localStorage data if present. depends on step 1
* Implement validation and normalization module for domains/URLs (accept subdomains, hyphens, longer TLDs; normalize to lowercase; add scheme as needed). parallel with step 3
* Implement cookie module to fetch and remove cookies safely (handle leading-dot domains, secure vs non-secure, and www/non-www variants). parallel with step 4
* Implement background service worker handler that receives a clear-cookies message, loads domains from storage, clears cookies, and returns per-domain results and errors. depends on steps 3–5
* Update popup logic to use the new modules and message the background to clear cookies; keep UI state synced with storage and handle errors in a user-friendly way. depends on steps 3–6
* Add Jest unit tests for storage, validation, and cookie modules, using mocks for chrome APIs. Include edge cases for domains, cookie URL building, and migration. parallel with steps 6–7
* Add integration-style unit tests for background message handler and popup controller behavior (using mocked chrome APIs and DOM via jsdom). depends on steps 6–7

## Relevant files

* manifest.json — remove content scripts, tighten permissions/host_permissions
* background.js — move logic to modular background handler and use chrome.storage.local
* content.js — split into popup controller module and remove page-injected assumptions
* popup.html — include only popup scripts; remove background script tag
* style.css — optional minor adjustments for error/success messaging
* New modules (to create): src/storage.js, src/validation.js, src/cookies.js, src/messaging.js, src/popup.js, src/background.js
* New tests (to create): tests/storage.test.js, tests/validation.test.js, tests/cookies.test.js, tests/background.test.js, tests/popup.test.js

## Verification

* Run Jest unit tests and confirm coverage for storage, validation, cookie removal, and background messaging.
* Manual smoke test in Chrome: add multiple domains, logout, confirm cookies cleared; verify no errors in extension service worker console.
* Validate permissions: install and check the extension only prompts for minimal required permissions.

## Decisions

* Popup-only UI, no content scripts.
* Use chrome.storage.local for all storage.
* Popup button only trigger for cookie clearing.
* Testing with Jest only (unit and integration-style tests).
* Least-privilege permissions.

## Further Considerations

* Domain list vs full URL storage: recommend storing normalized domains only for consistent cookie matching.
* Migration strategy: on first run, read localStorage if present and copy to chrome.storage.local, then clear localStorage.
* Reporting: consider returning per-domain results to show partial failures in the popup.