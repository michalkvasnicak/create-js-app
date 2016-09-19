const path = require('path');

module.exports = {
  env: {
    development: {
      plugins: [require.resolve('react-hot-loader/babel')],
    },
  },
  presets: [
    // JSX
    require.resolve('babel-preset-react'),
    // Webpack 2 includes support for es2015 imports, therefore we
    // disable the modules processing.
    [require.resolve('babel-preset-latest'), { es2015: { modules: false } }],
  ],
  plugins: [
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    [require.resolve('babel-plugin-transform-regenerator'), {
      // Async functions are converted to generators by babel-preset-latest
      async: false,
    }],
    [require.resolve('babel-plugin-transform-runtime'), {
      helpers: false,
      polyfill: false,
      regenerator: true,
      // Resolve the Babel runtime relative to the config.
      // You can safely remove this after ejecting:
      moduleName: path.dirname(require.resolve('babel-runtime/package'))
    }],
  ],
};

