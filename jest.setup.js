import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.ANTHROPIC_API_KEY = 'test-api-key'
process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis-url'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token'
process.env.USD_TO_BRL_EXCHANGE_RATE = '5.20'
process.env.DAILY_BUDGET_BRL = '100'
process.env.COST_ALERT_THRESHOLD = '80'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} 