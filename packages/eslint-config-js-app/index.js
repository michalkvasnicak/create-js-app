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
    parser: 'babel-eslint',
    parserOptions: {
      ecmaVersion: 8,
      sourceType: 'module',
      ecmaFeatures: {
        generators: true,
        experimentalObjectRestSpread: true,
      },
    },
    // temporarily disable flowtype-errors plugin
    // because it is messing with RAM
    plugins: ['babel', 'flowtype'/* , 'flowtype-errors'*/],
    // disable import rules temporarily
    rules: Object.assign(
      {},
      importPluginRules.reduce(
        (rules, rule) => Object.assign({}, rules, { [`import/${rule}`]: 'off' }), {}
      ),
      {
        'arrow-parens': 'off',
        'babel/arrow-parens': ['error', 'as-needed', {
          requireForBlockBody: true,
        }],
        // 'flowtype-errors/show-errors': 'error', todo enable when problems are solved
        'new-cap': 'off',
        'react/jsx-filename-extension': 'off',
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
