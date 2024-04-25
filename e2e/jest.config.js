//const baseConfig = require('../base.jest.config.js');
//
///** @type {import('@jest/types').Config} */
//module.exports = {
//  ...baseConfig,
//  rootDir: '..',
//  testMatch: ['<rootDir>/e2e/**/*.test.js'],
//  testTimeout: 180000,
//  maxWorkers: 1,
//  globalSetup: 'detox/runners/jest/globalSetup',
//  globalTeardown: 'detox/runners/jest/globalTeardown',
//  reporters: ['detox/runners/jest/reporter'],
//  testEnvironment: 'detox/runners/jest/testEnvironment',
//  verbose: true,
//  // setupFilesAfterEnv: ['./init.ts'],
//  setupFiles: [
//    '<rootDir>/node_modules/react-native-mmkv-storage/jest/mmkvJestSetup.js',
//  ], // Adjusted path here
//  testPathIgnorePatterns: ['/node_modules/'],
//  transformIgnorePatterns: [
//    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation)/)',
//  ],
//};

module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./init.js'],
  testTimeout: 120000,
};
