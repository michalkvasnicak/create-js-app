const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  presets: [
    require.resolve('babel-preset-react'),
    // webpack 2 supports es6 modules
    [
      require.resolve('babel-preset-latest-node6'),
      {
        es2015: { modules: false },
        'object-rest': true,
      },
    ],
  ],
  plugins: [
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...param, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread'),
  ],
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
