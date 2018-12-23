module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'reports',
  coverageReporters: ['lcov', 'text'],
  reporters: ['default', 'jest-junit'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupTestFrameworkScriptFile: './jest.setup.js',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!<rootDir>/jest.config',
    '!<rootDir>/jest.setup',
  ],
};
