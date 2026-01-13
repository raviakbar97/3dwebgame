module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@babylonjs/core$': '<rootDir>/tests/__mocks__/@babylonjs/core.ts'
  },
  // Mock Babylon.js for tests since it requires WebGL
  transformIgnorePatterns: [
    'node_modules/(?!(babylonjs)/)'
  ]
};