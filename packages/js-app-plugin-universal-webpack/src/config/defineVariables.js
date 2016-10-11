/* @flow */

/**
 * Defines variables used by webpack.DefinePlugin
 *
 * @param {Object} variables
 * @param {Object} predefined
 * @returns {Object}
 */
module.exports = function defineVariables(
  variables: Object,
  predefined: Object = {}
): Object {
  if (!Object.keys(variables).length) {
    return {};
  }

  return Object.keys(variables).reduce(
    (result: Object, key: string) => ({ ...result, [key]: JSON.stringify(variables[key]) }),
    defineVariables(predefined)
  );
};
