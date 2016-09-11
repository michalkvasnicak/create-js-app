/* @flow */
const webpackConfigFactory = require('./configFactory');

module.exports = function clientConfigFactory(options /*: Object */ = {}, args /*: Object */ = {}) /*: Object */ {
  const { mode = 'development' } = options;
  return webpackConfigFactory({ target: 'client', mode }, args);
};
