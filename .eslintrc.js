module.exports = {
  root: true,

  parser: 'babel-eslint',

  plugins: ['flowtype'],

  env: {
    commonjs: true,
    es6: true,
    node: true
  },

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      generators: true,
      experimentalObjectRestSpread: true
    }
  }
};
