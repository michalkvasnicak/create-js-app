/* @flow */
const defineVariables = require('../defineVariables');
const LoggerPlugin = require('../../webpack/LoggerPlugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const postCssImport = require('postcss-import');
const postCssCssNext = require('postcss-cssnext');
const postCssApply = require('postcss-apply');
const webpack = require('webpack');

module.exports = function createConfig(env: Environment, logger: LogGroup): Object {
  const { env: envVariables, settings }: ServerWebpackPluginConfiguration = env.getConfiguration();

  const serverSettings = settings.server;
  let plugins: (() => any)[] = [];
  let decorateLoaders: (loaders: Array<any>) => any = loaders => loaders;
  let whitelistedExternals = [];

  const pluginsInstatiators = serverSettings.webpackPlugins
    && serverSettings.webpackPlugins.production;

  if (Array.isArray(pluginsInstatiators)) {
    plugins = pluginsInstatiators;
  }

  const loadersDecorator = serverSettings.webpack
    && serverSettings.webpack.loadersDecorator
    && serverSettings.webpack.loadersDecorator.production;

  if (typeof loadersDecorator === 'function') {
    decorateLoaders = loadersDecorator;
  }

  const externalsWhitelist = serverSettings.webpack
    && serverSettings.webpack.externalsWhitelist
    && serverSettings.webpack.externalsWhitelist.production;

  if (Array.isArray(externalsWhitelist)) {
    whitelistedExternals = externalsWhitelist;
  }

  const variablesToDefine = {
    'process.env': defineVariables(envVariables, { IS_SERVER: true }),
  };

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
                  settings.babelrc || require.resolve('babel-preset-js-app/server'),
                ],
              },
            },
          ],
        },

        // css
        {
          test: /\.css$/,
          use: [
            {
              loader: 'css-loader/locals',
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
            { loader: 'url-loader', options: { emitFile: false, limit: 10000 } },
          ],
        },
        // file
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          use: [
            { loader: 'file-loader', options: { emitFile: false } },
          ],
        },
      ]),
    },
    node: {
      console: true,
    },
    plugins: [
      // define global variable
      new webpack.DefinePlugin(variablesToDefine),

      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

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
