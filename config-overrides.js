const path = require("path");

module.exports = (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    // @metamask/sdk ships a React-Native-only import that webpack 5 can't
    // resolve. On the web it's never executed, so a no-op stub is enough.
    "@react-native-async-storage/async-storage": path.resolve(
      __dirname,
      "src/shims/react-native-async-storage.js"
    ),
  };

  // Silence webpack's dynamic-require heuristic on @metamask/sdk internals.
  config.ignoreWarnings = config.ignoreWarnings || [];
  config.ignoreWarnings.push(/Critical dependency/);

  // superstruct/viem ship source maps that reference src/*.ts files they
  // don't publish — harmless, so stop the noise from source-map-loader.
  config.ignoreWarnings.push(/Failed to parse source map/);

  return config;
};