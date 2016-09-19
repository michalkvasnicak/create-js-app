module.exports = {
  env: {
    development: {
      plugins: [require.resolve('react-hot-loader/babel')],
    },
  },
  presets: [
    [
      require.resolve('babel-preset-latest-node6'),
      {
        'object-rest': true
      },
    ],
    require.resolve('babel-preset-react'),
  ],
  plugins: [
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread')
  ],
};

