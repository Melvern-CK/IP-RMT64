// Test setup file for Jest
process.env.NODE_ENV = 'test';

// Mock console.log to keep test output clean (optional)
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup test database configuration
process.env.DB_NAME = 'pokemon_test';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASS = process.env.DB_PASS || '';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';

// JWT Secret for testing
process.env.JWT_SECRET = 'test-secret-key';

// Google OAuth for testing
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';

// Set test timeout
jest.setTimeout(10000);
