const baseConfig = require("./base.jest.config.js");

module.exports = {
  ...baseConfig,
  setupFiles: [
    "node_modules/react-native/jest/setup.js",
    "node_modules/react-native-gesture-handler/jestSetup.js",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/e2e"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
};
