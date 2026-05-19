# One Click Logout

A Chrome extension to close all sessions for specified sites with one click by clearing their cookies. This is particularly useful for quickly logging off from social media or other distracting websites when you need to focus.

## Features

- **One-Click Logout:** Log out from all your pre-defined websites simultaneously.
- **Manage Website List:** Easily add or remove websites from your logout list.
- **Domain Normalization:** Automatically handles domain normalization (e.g., stripping 'www.').
- **Privacy Focused:** Only requests permissions for the websites you explicitly add.
- **Manifest V3:** Built using the latest Chrome Extension standards.

## Installation (Development Mode)

Since this extension is in development, you can load it locally in Chrome:

1. Clone this repository:
   ```bash
   git clone https://github.com/diegolas-code/one-click-logout.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top right corner.
4. Click the **Load unpacked** button.
5. Select the `one-click-logout` directory (the folder containing `manifest.json`).

## How to Use

1. Click the **One Click Logout** icon in your browser toolbar.
2. In the text input, enter the domain of a website you want to add (e.g., `facebook.com`, `linkedin.com`).
3. Click **Add**.
   - *Note: You may be prompted to grant permissions for the extension to access that specific site.*
4. To remove a website from the list, click the **×** button next to its name.
5. Once your list is ready, simply click the **Logout from all selected websites** button to clear sessions for everything in your list.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (for running tests)

### Running Tests

The project uses [Jest](https://jestjs.io/) for unit testing. To run the tests:

```bash
npm install
npm test
```

## Credits

- Created by [Diego Guaraz](https://github.com/diegolas-code).
- Inspired by the extension **Remove Cookies For Site** by [Nestor Urquiza](https://github.com/nestoru).
- Icons provided by [Freepik / Flaticon](https://www.flaticon.com/).

## License

MIT
