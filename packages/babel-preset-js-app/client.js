const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  compact: false,
  presets: [
    [require.resolve('babel-preset-env'), {
      modules: false, // webpack 2
      targets: {
        browsers: [
          'last 2 Chrome versions',
          'last 2 Firefox versions',
          'last 2 Edge versions',
          'last 2 Opera versions',
          'last 2 Safari versions',
          'last 2 iOS versions',
          'Explorer >= 11',
        ],
      },
      useBuiltIns: true,
    }],
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
