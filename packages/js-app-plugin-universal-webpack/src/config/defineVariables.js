/* @flow */

/**
 * Defines variables used by webpack.DefinePlugin
 *
 * @param {Object} variables
 * @returns {Object}
 */
module.exports = function defineVariables(variables: Object): Object {
  return Object.keys(variables).reduce(
    (result, key) => Object.assign({}, result, { [key]: JSON.stringify(variables[key]) }),
    {}
  );
};
