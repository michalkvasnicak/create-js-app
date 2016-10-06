/* @flow */
const autoprefixer = require('autoprefixer');
const defineVariables = require('../defineVariables');
const LoggerPlugin = require('../../webpack/LoggerPlugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

module.exports = function createConfig(env: Environment, logger: LogGroup): Object {
  const { env: envVariables, settings }: ServerWebpackPluginConfiguration = env.getConfiguration();

  return {
    bail: true,
    devtool: 'source-map',
    entry: [
      require.resolve('source-map-support/register'),
      require.resolve('./polyfills'),
      settings.server.index,
    ],
    target: 'node',
    externals: [nodeExternals({
      whitelist: [
        /\.(eot|woff|woff2|ttf|otf)$/,
        /\.(svg|png|jpg|jpeg|gif|ico)$/,
        /\.(mp4|mp3|ogg|swf|webp)$/,
        /\.(css|scss|sass|sss|less)$/,
      ],
    })],
    output: {
      path: settings.server.bundleDir,
      pathinfo: true,
      filename: 'server.js',
      publicPath: settings.server.publicPath || '/',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      extensions: ['.js', '.json', '.jsx'],
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [path.resolve(__dirname, '../../../node_modules')],
    },
    module: {
      loaders: [
        {
          enforce: 'pre',
          test: /\.(js|jsx)$/,
          loader: 'eslint',
          include: settings.appSrc,
          query: {
            configFile: settings.eslintrc,
            useEslintrc: false,
          },
        },
        // js
        {
          test: /\.(js|jsx)$/,
          include: settings.appSrc,
          loader: 'babel',
          query: {
            babelrc: false,
            presets: [
              settings.babelrc || require.resolve('babel-preset-js-app/server'),
            ],
          },
        },
        // css
        {
          test: /\.css$/,
          loader: 'fake-style!css?modules&-autoprefixer!postcss',
        },
        // json
        {
          test: /\.json$/,
          loader: 'json',
        },
        // url
        {
          test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: 'url',
          query: {
            limit: 10000,
            emitFile: false,
          },
        },
        // file
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          loader: 'file',
          query: {
            emitFile: false,
          },
        },
      ],
    },
    node: {
      console: true,
    },
    plugins: [
      // loader options
      new webpack.LoaderOptionsPlugin({
        options: {
          // context: __dirname,
          postcss: () => ([
            autoprefixer({
              browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 9', // React doesn't support IE8 anyway
              ],
            }),
          ]),
        },
      }),

      // define global variable
      new webpack.DefinePlugin({
        'process.env': defineVariables(envVariables),
      }),

      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

      new LoggerPlugin(logger),
    ],
  };
};