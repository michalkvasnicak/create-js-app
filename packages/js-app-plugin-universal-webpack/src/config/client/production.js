/* @flow */
const AssetsPlugin = require('../../webpack/AssetsPlugin');
const autoprefixer = require('autoprefixer');
const defineVariables = require('../defineVariables');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoggerPlugin = require('../../webpack/LoggerPlugin');
const path = require('path');
const postCssImport = require('postcss-import');
const postCssCssNext = require('postcss-cssnext');
const webpack = require('webpack');

module.exports = function createConfig(env: Environment, logger: LogGroup): Object {
  const { env: envVariables, settings }: ClientWebpackPluginConfiguration = env.getConfiguration();

  return {
    bail: true,
    devtool: 'source-map',
    entry: [
      require.resolve('./polyfills'),
      settings.client.index,
    ],
    output: {
      path: settings.client.bundleDir,
      pathinfo: true,
      filename: '[name]-[chunkhash].js',
      publicPath: settings.client.publicPath || '/',
    },
    resolve: {
      extensions: ['.js', '.json', '.jsx'],
    },
    // resolve loaders from this plugin directory
    resolveLoader: {
      modules: [
        path.resolve(__dirname, '../../../node_modules'),
        path.resolve(__dirname, '../../../../'), // resolve to project node_modules
      ],
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
              settings.babelrc || require.resolve('babel-preset-js-app/client'),
            ],
          },
        },
        // css
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: 'css?modules&minimize&-autoprefixer&importLoaders=1!postcss',
          }),
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
          },
        },
        // file
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          loader: 'file',
        },
      ],
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
    plugins: [
      // loader options
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname,
          eslint: {
            configFile: settings.eslintrc || require.resolve('eslint-config-js-app'),
            useEslintrc: false,
          },
          postcss: () => ([
            autoprefixer({
              browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 9', // React doesn't support IE8 anyway
              ],
            }),
            postCssImport(),
            postCssCssNext(),
          ]),
        },
      }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => /node_modules/.test(module.resource),
      }),

      // define global variable
      new webpack.DefinePlugin({
        'process.env': defineVariables(envVariables, { IS_CLIENT: true }),
      }),

      new webpack.optimize.OccurrenceOrderPlugin(),

      new webpack.optimize.DedupePlugin(),

      new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true, // React doesn't support IE8
          warnings: false,
        },
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
        },
      }),

      new ExtractTextPlugin({
        filename: '[name]-[contenthash:8].css',
        allChunks: true,
      }),

      new AssetsPlugin(env),

      new LoggerPlugin(logger),
    ],
  };
};
