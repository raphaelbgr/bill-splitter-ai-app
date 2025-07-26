const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.jsx'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uncrypto|@upstash|@supabase|isows|@supabase/realtime-js|@supabase/supabase-js)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
  preset: undefined,
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 
module.exports = createJestConfig(customJestConfig) 