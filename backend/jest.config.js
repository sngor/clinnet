// jest.config.js
module.exports = {
  verbose: true,
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  testMatch: [
    "**/tests/**/*.test.js?(x)",
    "**/__tests__/**/*.test.js?(x)",
  ],
  // Ignore SAM build artifacts to avoid package name collisions (jest-haste-map)
  modulePathIgnorePatterns: ["<rootDir>/.aws-sam/"],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "src/handlers/**/*.js",
    "!src/handlers/**/index.js", // Often, index.js files are just exports, adjust if needed
    "!src/lambda_layer/**", // Exclude Lambda layers from coverage
  ],
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],
  // Setup files to run *before* Jest executes the test code (and imports modules)
  setupFiles: ['./tests/setupTests.js'],
  // Setup files to run before each test file (after the test framework is installed in the environment)
  // setupFilesAfterEnv: ['./tests/setupTestsAfterEnv.js'], // if you have a setup file for this

  // Mock environment variables
  globals: {
    // It's better to set environment variables in the test files or a setup file
    // if they vary per test suite, but for global ones:
    // 'process.env.MEDICAL_REPORTS_TABLE': 'mock-medical-reports-table'
  },
  // Transform files with babel-jest
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // Babel configuration (can also be in .babelrc or babel.config.js)
  // If you don't have complex Babel needs, Jest might handle basic JS transformation fine without this.
  // However, if you use ES6 modules (import/export) in your .js files, you'll need Babel.
  // Make sure you have @babel/core, @babel/preset-env, and babel-jest installed.
};
