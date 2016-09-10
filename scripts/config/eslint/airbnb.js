module.exports = {
  root: true,
  env: {
    browser: true
  },
  extends: [
    require.resolve('eslint-config-airbnb')
  ],
  plugins: ['flowtype'],
  rules: {
    'import/*': 0,
    'react/require-extension': 0
  }
};
