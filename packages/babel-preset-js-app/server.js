const env = process.env.BABEL_ENV || process.env.NODE_ENV;

// this config is used for tests too so we use babel-preset-env only here :)

module.exports = {
  compact: false,
  presets: [
    [
      require.resolve('babel-preset-env'), {
        useBuiltIns: true,
        targets: {
          node: 'current',
        },
      },
    ],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...param, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread'),
    [require.resolve('react-loadable/babel'), { webpack: true, babel: true }],
    require.resolve('babel-plugin-idx'),
    require.resolve('babel-plugin-syntax-dynamic-import'),
    require.resolve('babel-plugin-dynamic-import-node'),
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
