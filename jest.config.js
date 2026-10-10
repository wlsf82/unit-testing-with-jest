module.exports = {
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    // Every test replaces the real mailer with a mock on purpose, so
    // measuring it would always read 0% and say nothing about the suite.
    '!src/mailer.js',
  ],
  coverageThreshold: {
    global: { statements: 85, branches: 80, functions: 85, lines: 85 },
  },
}
