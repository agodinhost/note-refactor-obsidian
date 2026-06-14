/* jest.config.js */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '.*\\.test\\.ts$',
    '.*\\.spec\\.ts$'
  ],
  coverageReporters: [
    'text',
    'lcov'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleDirectories: ['node_modules', 'tests/mocks'],
  // /* --- */
  // moduleNameMapper: {
  //   '^obsidian$': '<rootDir>/tests/mocks/obsidian.ts'
  // },
  // transform: {
  //   "^.+\\.tsx?$": [
  //     "ts-jest",
  //     {
  //       tsconfig: "tsconfig.json"
  //     }
  //   ]
  // }
};
/* EOF */