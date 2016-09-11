/* @flow */
const webpackConfigFactory = require('./configFactory');

module.exports = function serverConfigFactory(options /*: Object */ = {}, args /*: Object */ = {}) /*: Object */ {
  const { mode = 'development' } = options;
  return webpackConfigFactory({ target: 'server', mode }, args);
};
