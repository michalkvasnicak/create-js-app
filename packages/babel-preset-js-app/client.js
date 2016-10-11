const env = process.env.BABEL_ENV || process.env.NODE_ENV;
const path = require('path');

module.exports = {
  presets: [
    require.resolve('babel-preset-react'),
    // webpack 2 supports es6 modules
    [require.resolve('babel-preset-latest'), { es2015: { modules: false } }],
  ],
  plugins: [
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...param, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread'),
    // function* () { yield 42; yield 43; }
    [require.resolve('babel-plugin-transform-regenerator'), {
      // Async functions are converted to generators by babel-preset-latest
      async: false,
    }],
    // Polyfills the runtime needed for async/await and generators
    [require.resolve('babel-plugin-transform-runtime'), {
      helpers: false,
      polyfill: false,
      regenerator: true,
      // Resolve the Babel runtime relative to the config.
      moduleName: path.dirname(require.resolve('babel-runtime/package')),
    }],
  ],
};

if (env === 'development' || env === 'test') {
  const devPlugins = [
    // Adds component stack to warning messages
    require.resolve('babel-plugin-transform-react-jsx-source'),
    // Adds __self attribute to JSX which React will use for some warnings
    require.resolve('babel-plugin-transform-react-jsx-self'),
  ];

  module.exports.plugins.push(...devPlugins);
}
