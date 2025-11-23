
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: './tsconfig.jest.json' }],
  },
  clearMocks: true,
};
