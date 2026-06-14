export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "tests/mocks"],
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/tests/mocks/obsidian.ts'
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json"
      }
    ]
  }
};
