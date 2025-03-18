export function createRequest(overrides = {}) {
  return {
    user: { _id: 'user-id', ...overrides },
    get: jest.fn(),
    header: jest.fn(),
  } as unknown as CustomRequest;
}
