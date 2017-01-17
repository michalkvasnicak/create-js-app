/* @flow */
const defineVariables = require('../defineVariables');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const findCacheDir = require('find-cache-dir');
const LoggerPlugin = require('../../webpack/LoggerPlugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const postCssImport = require('postcss-import');
const postCssCssNext = require('postcss-cssnext');
const ServerListenerPlugin = require('../../webpack/ServerListenerPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const webpack = require('webpack');

module.exports = function createConfig(env: Environment, logger: LogGroup): Object {
  const { env: envVariables, settings }: ServerWebpackPluginConfiguration = env.getConfiguration();

  const serverSettings = settings.server;
  let plugins: (() => any)[] = [];
  let decorateLoaders: (loaders: Array<any>) => any = loaders => loaders;
  let whitelistedExternals = [];

  const pluginsInstatiators = serverSettings.webpackPlugins
    && serverSettings.webpackPlugins.development;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator = serverSettings.webpack
    && serverSettings.webpack.loadersDecorator
    && serverSettings.webpack.loadersDecorator.development;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const externalsWhitelist = serverSettings.webpack
    && serverSettings.webpack.externalsWhitelist
    && serverSettings.webpack.externalsWhitelist.development;

  if (Array.isArray(externalsWhitelist)) {
    whitelistedExternals = externalsWhitelist;
  }

  const variablesToDefine = {
    'process.env': defineVariables(envVariables, { IS_SERVER: true }),
  };

  return {
    devtool: 'eval',
    entry: [
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
        ...whitelistedExternals,
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
        },
        // js
        {
          test: /\.(js|jsx)$/,
          include: settings.appSrc,
          loader: 'babel-loader',
          query: {
            babelrc: false,
            presets: [
              settings.babelrc || require.resolve('babel-preset-js-app/server'),
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
            {
              loader: 'css-loader/locals',
              query: {
                modules: true,
                importLoaders: 1,
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
            emitFile: false,
          },
        },
        // file
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          loader: 'file-loader',
          query: {
            emitFile: false,
          },
        },
      ]),
    },
    node: {
      console: true,
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

      new webpack.NoErrorsPlugin(),

      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

      // case sensitive paths
      new CaseSensitivePathsPlugin(),

      // watch missing node modules
      new WatchMissingNodeModulesPlugin(settings.appNodeModulesDir),

      new LoggerPlugin(logger),

      // Custom plugins
      ...(plugins.map(
        pluginInstantiator => pluginInstantiator(
          env.getConfiguration(),
          variablesToDefine
        ))
      ),

      new ServerListenerPlugin(env, logger),
    ],
  };
};
