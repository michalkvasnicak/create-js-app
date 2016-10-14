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
): { [key: string]: string } {
  if (!Object.keys(variables).length) {
    return {};
  }

  return Object.keys(variables).reduce(
    (result: Object, key: string) => {
      let value = variables[key];

      if (typeof value !== 'string') {
        value = String(value);
      }

      return {
        ...result,
        [key]: JSON.stringify(value),
      };
    },
    defineVariables(predefined)
  );
};
