/* @flow */
const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-js-app/server')],
});
