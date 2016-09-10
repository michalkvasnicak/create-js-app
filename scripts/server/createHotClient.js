'use strict';

const express = require('express');
const createWebpackMiddlware = require('webpack-dev-middleware');
const createWebpackHotMiddleware = require('webpack-hot-middleware');

module.exports = function createHotClient(compiler) {
  const app = express();
  const webpackDevMiddleware = createWebpackMiddlware(compiler, {
    quiet: true,
    noInfo: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    publicPath: compiler.options.output.publicPath,
    watchOptions: {
      ignored: /node_modules/
    }
  });

  app.use(webpackDevMiddleware);
  app.use(createWebpackHotMiddleware(compiler, { log: false }));

  const listener = app.listen(process.env.CLIENT_DEVSERVER_PORT);

  return {
    close() {
      webpackDevMiddleware.close();

      return new Promise(resolve => {
        listener.close(resolve);
      });
    }
  };
};

