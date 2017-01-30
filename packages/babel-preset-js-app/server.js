const env = process.env.BABEL_ENV || process.env.NODE_ENV;

// this config is used for tests too so we use babel-preset-env only here :)

module.exports = {
  compact: false,
  presets: [
    [
      require('babel-preset-env').default, { // eslint-disable-line global-require
        debug: true,
        useBuiltIns: true,
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
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
