module.exports = {
  coverageReporters: ["html", "lcov", "text-summary"],
  collectCoverageFrom: [
    "apps/**/*.{ts,tsx}",
    "libs/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*.test.{ts,tsx}",
    "!**/*.spec.{ts,tsx}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/coverage/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
  preset: "ts-jest",
  testEnvironment: "node",
};
