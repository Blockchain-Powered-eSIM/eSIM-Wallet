const baseConfig = require('../base.jest.config.js');

/** @type {import('@jest/types').Config} */
module.exports = {
  ...baseConfig,
  rootDir: '..',
  testMatch: [
    '<rootDir>/e2e/firstTest.spec.js',
    '<rootDir>/__test__/native/IdentityManager.test.js',
  ],
  testTimeout: 180000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  setupFiles: [
    '<rootDir>/node_modules/react-native-mmkv-storage/jest/mmkvJestSetup.js',
  ], // Adjusted path here
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation)/)',
  ],
};
