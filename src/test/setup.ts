import { expect, afterAll, afterEach, beforeAll, vi } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

/**
 * Mock Server for API integration testing
 * Intercepts HTTP requests during tests using Mock Service Worker
 */
export const mockServer = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  mockServer.listen();
});

// Reset request handlers between tests
afterEach(() => {
  mockServer.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  mockServer.close();
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
