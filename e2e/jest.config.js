/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};

const baseConfig = require("../base.jest.config.js");

module.exports = {
  ...baseConfig,
  setupFilesAfterEnv: ["./init.ts"],
  setupFiles: [
    "<rootDir>/../../../node_modules/react-native/jest/setup.js",
    "<rootDir>/../../../node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/../../../test/setup.ts",
  ],
  testPathIgnorePatterns: ["/node_modules/"],
};
