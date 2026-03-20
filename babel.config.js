const path = require("path");
const { expoRouterBabelPlugin } = require("babel-preset-expo/build/expo-router-plugin");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [require.resolve("babel-preset-expo", { paths: [path.join(__dirname, "mobile")] })],
    plugins: [expoRouterBabelPlugin],
  };
};
