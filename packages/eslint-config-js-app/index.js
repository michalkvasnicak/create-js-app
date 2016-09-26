const importPluginRules = Object.keys(require('eslint-plugin-import').rules);
const airbnbConfig = Object.assign(
  {},
  require('eslint-config-airbnb'),
  {
    root: true,
    env: {
      browser: true,
      commonjs: true,
      es6: true,
      jest: true,
      node: true,
    },
    parserOptions: {
      sourceType: 'module',
      ecmaFeatures: {
        generators: true,
        experimentalObjectRestSpread: true,
      },
    },
    plugins: ['flowtype', 'flowtype-errors'],
    // disable import rules temporarily
    rules: Object.assign(
      {},
      importPluginRules.reduce(
        (rules, rule) => Object.assign({}, rules, { [`import/${rule}`]: 'off' }), {}
      ),
      {
        'flowtype-errors/show-errors': 'error',
      }
    ),
    settings: {
      flowtype: {
        onlyFilesWithFlowAnnotation: true,
      },
    },
  }
);

// add flowtype recommended configuration
airbnbConfig.extends.push('plugin:flowtype/recommended');

module.exports = airbnbConfig;
