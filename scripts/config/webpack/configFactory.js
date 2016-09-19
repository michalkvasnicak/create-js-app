/* @flow */
/* eslint-disable no-console,import/no-extraneous-dependencies */

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const { removeEmpty, ifElse, merge } = require('./utils');

const appRootPath = process.cwd();

function webpackConfigFactory(options /*: Object */, args /*: Object */) /*: Object */ {
  const { target, mode } = options;
  const { eslint = require.resolve('../../config/eslint/default') } = args;

  const isDev = mode === 'development';
  const isProd = mode === 'production';
  const isClient = target === 'client';
  const isServer = target === 'server';

  const ifDev = ifElse(isDev);
  const ifProd = ifElse(isProd);
  const ifClient = ifElse(isClient);
  const ifServer = ifElse(isServer);
  const ifDevClient = ifElse(isDev && isClient);
  const ifDevServer = ifElse(isDev && isServer);
  const ifProdClient = ifElse(isProd && isClient);

  const CLIENT_DEVSERVER_PORT = process.env.CLIENT_DEVSERVER_PORT || 7000;
  const CLIENT_BUNDLE_OUTPUT_PATH = process.env.CLIENT_BUNDLE_OUTPUT_PATH || './build/client';
  const SERVER_BUNDLE_OUTPUT_PATH = process.env.SERVER_BUNDLE_OUTPUT_PATH || './build/server';
  const CLIENT_BUNDLE_HTTP_PATH = process.env.CLIENT_BUNDLE_HTTP_PATH || '/client-assets/';
  const SERVER_PORT = process.env.SERVER_PORT || 3000;
  const DISABLE_SSR = process.env.DISABLE_SSR ? process.env.DISABLE_SSR : false;
  const CLIENT_BUNDLE_ASSETS_FILENAME = process.env.CLIENT_BUNDLE_ASSETS_FILENAME || 'assets.json';
  const CLIENT_BUNDLE_CACHE_MAXAGE = process.env.CLIENT_BUNDLE_CACHE_MAXAGE || '365d';

  return {
    // We need to state that we are targetting "node" for our server bundle.
    target: ifServer('node', 'web'),
    // We have to set this to be able to use these items when executing a
    // server bundle.  Otherwise strangeness happens, like __dirname resolving
    // to '/'.  There is no effect on our client bundle.
    node: {
      __dirname: true,
      __filename: true,
    },
    // Anything listed in externals will not be included in our bundle.
    externals: removeEmpty(
      // We don't want our node_modules to be bundled with our server package,
      // prefering them to be resolved via native node module system.  Therefore
      // we use the `webpack-node-externals` library to help us generate an
      // externals config that will ignore all node_modules.
      ifServer(nodeExternals({
        // NOTE: !!!
        // However the node_modules may contain files that will rely on our
        // webpack loaders in order to be used/resolved, for example CSS or
        // SASS. For these cases please make sure that the file extensions
        // are added to the below list. We have added the most common formats.
        whitelist: [
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/,
        ],
      }))
    ),
    devtool: ifElse(isServer || isDev)(
      // We want to be able to get nice stack traces when running our server
      // bundle.  To fully support this we'll also need to configure the
      // `node-source-map-support` module to execute at the start of the server
      // bundle.  This module will allow the node to make use of the
      // source maps.
      // We also want to be able to link to the source in chrome dev tools
      // whilst we are in development mode. :)
      'source-map',
      // When in production client mode we don't want any source maps to
      // decrease our payload sizes.
      // This form has almost no cost.
      'hidden-source-map'
    ),
    // Define our entry chunks for our bundle.
    entry: merge(
      {
        main: removeEmpty(
          ifDevClient(require.resolve('react-hot-loader/patch')),
          ifDevClient(`${require.resolve('webpack-hot-middleware/client')}?reload=true&path=http://localhost:${CLIENT_DEVSERVER_PORT}/__webpack_hmr`),
          path.resolve(appRootPath, `./src/${target}/index.js`)
        ),
      }
    ),
    output: {
      // The dir in which our bundle should be output.
      path: path.resolve(
        appRootPath,
        isClient
          ? CLIENT_BUNDLE_OUTPUT_PATH
          : SERVER_BUNDLE_OUTPUT_PATH
      ),
      // The filename format for our bundle's entries.
      filename: ifProdClient(
        // We include a hash for client caching purposes.  Including a unique
        // has for every build will ensure browsers always fetch our newest
        // bundle.
        '[name]-[chunkhash].js',
        // We want a determinable file name when running our server bundles,
        // as we need to be able to target our server start file from our
        // npm scripts.  We don't care about caching on the server anyway.
        // We also want our client development builds to have a determinable
        // name for our hot reloading client bundle server.
        '[name].js'
      ),
      chunkFilename: '[name]-[chunkhash].js',
      // This is the web path under which our webpack bundled output should
      // be considered as being served from.
      publicPath: ifDev(
        // As we run a seperate server for our client and server bundles we
        // need to use an absolute http path for our assets public path.
        `http://localhost:${CLIENT_DEVSERVER_PORT}${CLIENT_BUNDLE_HTTP_PATH}`,
        // Otherwise we expect our bundled output to be served from this path.
        CLIENT_BUNDLE_HTTP_PATH
      ),
      // When in server mode we will output our bundle as a commonjs2 module.
      libraryTarget: ifServer('commonjs2', 'var'),
    },
    resolve: {
      // These extensions are tried when resolving a file.
      extensions: [
        '.js',
        '.jsx',
        '.json',
        '.css',
        '.scss',
      ],
      modulesDirectories: [
        'node_modules',
        path.resolve(__dirname, '../../../../node_modules'),
        path.resolve(__dirname, '../../../../../node_modules'),
      ],
    },
    postcss: [autoprefixer],
    plugins: removeEmpty(
      // We use this so that our generated [chunkhash]'s are only different if
      // the content for our respective chunks have changed.  This optimises
      // our long term browser caching strategy for our client bundle, avoiding
      // cases where browsers end up having to download all the client chunks
      // even though 1 or 2 may have only changed.
      ifClient(new WebpackMd5Hash()),

      // Each key passed into DefinePlugin is an identifier.
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified (including functions).
      // If the value is an object all keys are removeEmpty the same way.
      // If you prefix typeof to the key, it’s only removeEmpty for typeof calls.
      new webpack.DefinePlugin({
        'process.env': {
          // NOTE: The NODE_ENV key is especially important for production
          // builds as React relies on process.env.NODE_ENV for optimizations.
          NODE_ENV: JSON.stringify(mode),
          IS_CLIENT: JSON.stringify(isClient),
          IS_SERVER: JSON.stringify(isServer),
          // All the below items match the config items in our .env file. Go
          // to the .env_example for a description of each key.
          SERVER_PORT: JSON.stringify(SERVER_PORT),
          CLIENT_DEVSERVER_PORT: JSON.stringify(CLIENT_DEVSERVER_PORT),
          DISABLE_SSR: JSON.stringify(DISABLE_SSR),
          SERVER_BUNDLE_OUTPUT_PATH: JSON.stringify(SERVER_BUNDLE_OUTPUT_PATH),
          CLIENT_BUNDLE_OUTPUT_PATH: JSON.stringify(CLIENT_BUNDLE_OUTPUT_PATH),
          CLIENT_BUNDLE_ASSETS_FILENAME: JSON.stringify(CLIENT_BUNDLE_ASSETS_FILENAME),
          CLIENT_BUNDLE_HTTP_PATH: JSON.stringify(CLIENT_BUNDLE_HTTP_PATH),
          CLIENT_BUNDLE_CACHE_MAXAGE: JSON.stringify(CLIENT_BUNDLE_CACHE_MAXAGE),
        },
      }),

      ifClient(
        // Generates a JSON file containing a map of all the output files for
        // our webpack bundle.  A necessisty for our server rendering process
        // as we need to interogate these files in order to know what JS/CSS
        // we need to inject into our HTML.
        new AssetsPlugin({
          filename: CLIENT_BUNDLE_ASSETS_FILENAME,
          path: path.resolve(appRootPath, CLIENT_BUNDLE_OUTPUT_PATH),
        })
      ),

      // We don't want webpack errors to occur during development as it will
      // kill our dev servers.
      ifDev(new webpack.NoErrorsPlugin()),

      // We need this plugin to enable hot module reloading for our dev server.
      ifDevClient(new webpack.HotModuleReplacementPlugin()),

      // Ensure only 1 file is output for the server bundles.  This makes it
      // much easer for us to clear the module cache when reloading the server.
      ifDevServer(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })),

      // Adds options to all of our loaders.
      ifProdClient(
        new webpack.LoaderOptionsPlugin({
          // Indicates to our loaders that they should minify their output
          // if they have the capability to do so.
          minimize: true,
          // Indicates to our loaders that they should enter into debug mode
          // should they support it.
          debug: false,
        })
      ),

      ifProdClient(
        // JS Minification.
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true,
            warnings: false,
          },
        })
      ),

      ifProd(
        // This is actually only useful when our deps are installed via npm2.
        // In npm2 its possible to get duplicates of dependencies bundled
        // given the nested module structure. npm3 is flat, so this doesn't
        // occur.
        new webpack.optimize.DedupePlugin()
      ),

      ifProdClient(
        // This is a production client so we will extract our CSS into
        // CSS files.
        new ExtractTextPlugin({ filename: '[name]-[chunkhash].css', allChunks: true })
      )
    ),
    module: {
      preLoaders: [
        {
          test: /\.jsx?$/,
          loader: require.resolve('eslint-loader'),
          exclude: /node_modules/,
          query: {
            baseConfig: false,
            configFile: eslint
          }
        }
      ],
      loaders: [
        // Javascript
        {
          test: /\.jsx?$/,
          loader: require.resolve('babel-loader'),
          exclude: [
            /node_modules/,
            path.resolve(appRootPath, CLIENT_BUNDLE_OUTPUT_PATH),
            path.resolve(appRootPath, SERVER_BUNDLE_OUTPUT_PATH),
          ],
          query: ifElse(isServer)(
            require('../babel/config.server'),
            require('../babel/config.client')
          ),
        },

        // JSON
        {
          test: /\.json$/,
          loader: require.resolve('json-loader'),
        },

        // Images and Fonts
        {
          test: /\.(jpg|jpeg|png|gif|ico|eot|svg|ttf|woff|woff2|otf)$/,
          loader: require.resolve('url-loader'),
          query: {
            // Any file with a byte smaller than this will be "inlined" via
            // a base64 representation.
            limit: 10000,
            // We only emit files when building a client bundle, for the server
            // bundles this will just make sure any file imports will not fall
            // over.
            emitFile: isClient,
          },
        },

        // (S)CSS
        merge(
          { test: /(\.css)$/ },
          // When targetting the server we use the "/locals" version of the
          // css loader.
          ifServer({
            loaders: [
              `${require.resolve('css-loader/locals')}?modules`,
              require.resolve('postcss-loader'),
            ],
          }),
          // For a production client build we use the ExtractTextPlugin which
          // will extract our CSS into CSS files.  The plugin needs to be
          // registered within the plugins section too.
          ifProdClient({
            loader: ExtractTextPlugin.extract({
              notExtractLoader: require.resolve('style-loader'),
              loader: [`${require.resolve('css-loader')}?modules`, require.resolve('postcss-loader')],
            }),
          }),
          // For a development client we will use a straight style & css loader
          // along with source maps.  This combo gives us a better development
          // experience.
          ifDevClient({
            loaders: [
              require.resolve('style-loader'),
              { loader: require.resolve('css-loader'), query: { modules: true, sourceMap: true } },
              require.resolve('postcss-loader'),
            ],
          })
        ),
      ],
    },
  };
}

module.exports = webpackConfigFactory;
