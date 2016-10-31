const env = process.env.BABEL_ENV || process.env.NODE_ENV;

// this config is used for tests too so we use babel-preset-env only here :)

module.exports = {
  compact: false,
  presets: [
    [
      require('babel-preset-env').default, { // eslint-disable-line global-require
        targets: {
          node: parseFloat(process.versions.node),
        },
      },
    ],
    // JSX, Flow
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...param, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread'),
    // necessary for babel-preset-env to work
    require.resolve('babel-plugin-transform-es2015-destructuring'),
    // ({ var, ...rest }) => {}
    require.resolve('babel-plugin-transform-es2015-parameters'),
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
