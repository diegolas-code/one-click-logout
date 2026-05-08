function createChromeMock() {
	return {
		storage: {
			local: {
				get: jest.fn(),
				set: jest.fn(),
			},
		},
		cookies: {
			getAll: jest.fn(),
			remove: jest.fn(),
		},
		runtime: {
			sendMessage: jest.fn(),
			lastError: null,
			onMessage: {
				addListener: jest.fn(),
			},
		},
		permissions: {
			contains: jest.fn(),
			request: jest.fn(),
		},
	};
}

beforeEach(() => {
	global.chrome = createChromeMock();
	jest.clearAllMocks();
});
