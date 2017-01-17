/* @flow */
const AssetsPlugin = require('../../webpack/AssetsPlugin');
const CompressionPlugin = require('compression-webpack-plugin');
const defineVariables = require('../defineVariables');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoggerPlugin = require('../../webpack/LoggerPlugin');
const path = require('path');
const postCssImport = require('postcss-import');
const postCssCssNext = require('postcss-cssnext');
const postCssApply= require('postcss-apply');
const webpack = require('webpack');

module.exports = function createConfig(env: Environment, logger: LogGroup): Object {
  const { env: envVariables, settings }: ClientWebpackPluginConfiguration = env.getConfiguration();

  const clientSettings = settings.client;
  let plugins: (() => any)[] = [];
  let decorateLoaders: (loaders: Array<any>) => any = loaders => loaders;

  const pluginsInstatiators = clientSettings.webpackPlugins
    && clientSettings.webpackPlugins.production;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator = clientSettings.webpack
    && clientSettings.webpack.loadersDecorator
    && clientSettings.webpack.loadersDecorator.production;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const variablesToDefine = {
    'process.env': defineVariables(envVariables, { IS_CLIENT: true }),
  };

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
      rules: decorateLoaders([
        // eslint
        {
          enforce: 'pre',
          test: /\.(js|jsx)$/,
          use: [
            {
              loader: 'eslint-loader',
              options: {
                configFile: settings.eslintrc || require.resolve('eslint-config-js-app'),
                useEslintrc: false,
              },
            },
          ],
          include: settings.appSrc,
        },

        // js
        {
          test: /\.(js|jsx)$/,
          include: settings.appSrc,
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [
                  settings.babelrc || require.resolve('babel-preset-js-app/client'),
                ],
              },
            },
          ],
        },

        // css
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  minimize: true,
                  autoprefixer: false,
                  importLoaders: 1,
                  localIdentName: '[hash:base64]',
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: () => [
                    postCssImport(),
                    postCssCssNext({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9',
                      ],
                    }),
                    postCssApply(),
                  ],
                },
              },
            ],
          }),
        },

        // json
        {
          test: /\.json$/,
          use: [
            { loader: 'json-loader' },
          ],
        },

        // url
        {
          test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          use: [
            { loader: 'url-loader', options: { limit: 10000 } },
          ],
        },
        // file
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          use: [
            { loader: 'file-loader' },
          ],
        },
      ]),
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
    plugins: [
      // loader options
      new webpack.LoaderOptionsPlugin({
        debug: false,
        minimize: true,
      }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => /node_modules/.test(module.resource),
      }),

      // define global variable
      new webpack.DefinePlugin(variablesToDefine),

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
        sourceMap: true,
      }),

      new ExtractTextPlugin({
        filename: '[name]-[contenthash:8].css',
        allChunks: true,
      }),

      new AssetsPlugin(env),

      new CompressionPlugin({
        asset: '[path].gz',
        algorithm: 'gzip',
      }),

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
