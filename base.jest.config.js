module.exports = {
    preset: "react-native",
    transformIgnorePatterns: [
      "node_modules/(?!(react-native|react-native-.*|react-navigation|react-navigation-.*|@react-navigation|@storybook|@react-native-community)/)",
      "@shared/",
    ],
    transform: {
      "^.+\\.[jt]sx?$": [
        "babel-jest",
        {
          configFile: "./babel.config.js",
        },
      ],
    },
    roots: ["."],
};
