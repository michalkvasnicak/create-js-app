const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  presets: [
    require.resolve('./shared'),
    // webpack 2 supports es6 modules
    [require.resolve('babel-preset-latest-minimal'), { es2015: { modules: false } }],
  ],
  plugins: [],
};

if (env === 'development' || env === 'test') {
  const devPlugins = [
    // Adds component stack to warning messages
    require.resolve('babel-plugin-transform-react-jsx-source'),
    // Adds __self attribute to JSX which React will use for some warnings
    require.resolve('babel-plugin-transform-react-jsx-self'),
  ];

  module.exports.plugins.push(...devPlugins);
}
