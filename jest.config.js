module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'reports',
  coverageReporters: ['lcov', 'text'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'jest tests',
        suiteNameTemplate: '{filepath}',
        output: 'reports/junit.xml',
        classNameTemplate: '{filename}',
        titleTemplate: '{title}',
        ancestorSeparator: ' > ',
      },
    ],
  ],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupTestFrameworkScriptFile: './jest.setup.js',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!<rootDir>/jest.config',
    '!<rootDir>/jest.setup',
  ],
};
