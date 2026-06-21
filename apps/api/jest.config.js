module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(e2e-spec|spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@crm-os/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@crm-os/database$': '<rootDir>/../../packages/database/src/index.ts',
    '^@crm-os/permissions$': '<rootDir>/../../packages/permissions/src/index.ts',
    '^@crm-os/events$': '<rootDir>/../../packages/events/src/index.ts',
  },
  modulePaths: ['<rootDir>/../../node_modules'],
};
