const path = require('path');

module.exports = {
  env: {
    // everything here will be passed directly to webpack build
    // using DefinePlugin
    ASSETS_PATH: path.resolve(__dirname, './build/assets.json'),
    ASSETS_DIR: path.resolve(__dirname, './build/client'),
    PUBLIC_DIR: path.resolve(__dirname, './public'),
    SERVER_PORT: 3000
  },
  plugins: [require('js-app-plugin-universal-webpack')],
  settings: {
    client: {
      index: path.resolve(__dirname, './src/client/index.js'),
      bundleDir: path.resolve(__dirname, './build/client'),
    },
    server: {
      index: path.resolve(__dirname, './src/server/index.js'),
      bundleDir: path.resolve(__dirname, './build/server'),
    }
  }
};
