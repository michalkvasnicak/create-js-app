/* @flow */

const express = require('express');
const createWebpackMiddleware = require('webpack-dev-middleware');
const createWebpackHotMiddleware = require('webpack-hot-middleware');

function createHotClient(compiler /*: Object */, eventEmitter /*: events$EventEmitter */) /*: ServerManager */ {
  const app = express();
  const webpackDevMiddleware = createWebpackMiddleware(compiler, {
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
}

module.exports = createHotClient;
