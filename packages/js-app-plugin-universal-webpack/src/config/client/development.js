/* @flow */
const AssetsPlugin = require('../../webpack/AssetsPlugin');
const defineVariables = require('../defineVariables');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const findCacheDir = require('find-cache-dir');
const LoggerPlugin = require('../../webpack/LoggerPlugin');
const path = require('path');
const postCssImport = require('postcss-import');
const postCssCssNext = require('postcss-cssnext');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const webpack = require('webpack');

module.exports = function createConfig(env: Environment, logger: LogGroup): Object {
  const {
    env: envVariables,
    settings,
  }: ClientWebpackPluginConfiguration = env.getConfiguration();

  const clientSettings = settings.client;
  let plugins: (() => any)[] = [];
  let decorateLoaders: (loaders: Array<any>) => any = loaders => loaders;

  const pluginsInstatiators = clientSettings.webpackPlugins
    && clientSettings.webpackPlugins.development;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator = clientSettings.webpack
    && clientSettings.webpack.loadersDecorator
    && clientSettings.webpack.loadersDecorator.development;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const variablesToDefine = {
    'process.env': defineVariables(envVariables, { IS_CLIENT: true }),
  };

  return {
    devtool: 'eval',
    entry: [
      `${require.resolve('react-dev-utils/webpackHotDevClient')}`,
      require.resolve('./polyfills'),
      settings.client.index,
    ],
    output: {
      path: settings.client.bundleDir,
      pathinfo: true,
      filename: '[name].js',
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
      loaders: decorateLoaders([
        {
          enforce: 'pre',
          test: /\.(js|jsx)$/,
          loader: 'eslint-loader',
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
          loader: 'babel-loader',
          query: {
            babelrc: false,
            presets: [
              settings.babelrc || require.resolve('babel-preset-js-app/client'),
            ],
            cacheDirectory: findCacheDir({
              name: 'create-js-app-scripts',
            }),
          },
        },
        // css
        {
          test: /\.css$/,
          loaders: [
            'style-loader',
            {
              loader: 'css',
              query: {
                modules: true,
                importLoaders: true,
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
            },
            'postcss-loader',
          ],
        },
        // json
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
        // url
        {
          test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: 'url-loader',
          query: {
            limit: 10000,
          },
        },
        // file
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          loader: 'file-loader',
        },
      ]),
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
    plugins: [
      new AssetsPlugin(env),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => /node_modules/.test(module.resource),
      }),

      // loader options
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname,
          eslint: {
            configFile: settings.eslintrc || require.resolve('eslint-config-js-app'),
            useEslintrc: false,
          },
          postcss: () => ([
            postCssImport(),
            postCssCssNext({
              browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 9',
              ],
            }),
          ]),
        },
      }),

      // define global variable
      new webpack.DefinePlugin(variablesToDefine),

      // case sensitive paths
      new CaseSensitivePathsPlugin(),

      // hot replacement
      new webpack.HotModuleReplacementPlugin(),

      // watch missing node modules
      new WatchMissingNodeModulesPlugin(settings.appNodeModulesDir),

      // Logger plugin
      new LoggerPlugin(logger),

      // Custom plugins
      ...(plugins.map(
        pluginInstantiator => pluginInstantiator(
          env.getConfiguration(),
          variablesToDefine
        ))
      ),
    ],
  };
};
