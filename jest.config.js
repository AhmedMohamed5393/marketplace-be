// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/modules/shared/$1',
    '^@config/(.*)$': './src/config/$1',
  },
};
