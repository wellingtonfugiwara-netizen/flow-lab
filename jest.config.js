/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/logic/**/*.ts', '!src/logic/types.ts', '!src/logic/levels.ts'],
  // Gate: build só sai se a lógica estiver coberta. Mesma política do Sudoku Lab.
  coverageThreshold: {
    global: { statements: 95, branches: 88, functions: 90, lines: 95 },
  },
  coverageReporters: ['text-summary', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transform: {
    '^.+\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
};
