/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: 'components',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            useESM: true,
          },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testMatch: ['<rootDir>/components/**/*.test.tsx'],
    },
    {
      displayName: 'services',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      transform: {
        '^.+\\.ts?$': [
          'ts-jest',
          {
            useESM: true,
          },
        ],
      },
      extensionsToTreatAsEsm: ['.ts'],
      testMatch: ['<rootDir>/services/**/*.test.ts'],
    },
  ],
};
