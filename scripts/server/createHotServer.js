/* @flow */

const openBrowser = require('../utils/openBrowser');
const path = require('path');

function createHotServer(compiler /*: Object */, eventEmitter /*: events$EventEmitter */) /*: ServerManager */ {
  const sockets = {
    id: 0,
    connections: {}
  };
  let runningServer;

  compiler.plugin('done', stats => {
    if (stats.hasErrors()) {
      eventEmitter.emit('server-log-error', 'Build has errors, keeping previous build running');
      return;
    }

    if (stats.hasWarnings()) {
      eventEmitter.emit('server-log-warning', 'Build compiled with warnings');
    } else {
      eventEmitter.emit('server-log-success', 'Build succeeded');
    }

    // Make sure our newly built server bundles aren't in the module cache.
    Object.keys(require.cache).forEach(modulePath => {
      if (~modulePath.indexOf(compiler.options.output.path)) {
        delete require.cache[modulePath];
      }
    });

    const compiledOutputPath = path.resolve(
      compiler.options.output.path, `${Object.keys(compiler.options.entry)[0]}.js`
    );

    // First try to close previous server so we don't have conflict in ports
    // then require new server (it will automatically start new server)
    const closePreviousServer = new Promise(resolve => {
      if (runningServer) {
        eventEmitter.emit('server-log', 'Restarting server');

        // destroy all connections
        for (const socketId in sockets.connections) {
          sockets.connections[socketId].destroy();
        }

        runningServer.close(resolve);
        return;
      }

      resolve();
    });

    const startServer = closePreviousServer.then(
      () => new Promise((resolve, reject) => {
        try {
          const shouldOpenBrowser = !runningServer;

          runningServer = require(compiledOutputPath).default;

          // listen to all connections, we need this to close server
          runningServer.on('connection', socket => {
            const socketId = sockets.id++;
            sockets.connections[socketId] = socket;

            socket.on('close', () => delete sockets.connections[socketId]);
          });

          const url = `http://localhost:${process.env.SERVER_PORT || 3000}`;

          eventEmitter.emit('server-log-info', `Server is listening on ${url}`);

          shouldOpenBrowser && openBrowser(url);
        } catch (err) {
          reject(err);
        }

        resolve();
      }),
      err => {
        eventEmitter.emit('server-log-error', 'Error closing previous server');
        eventEmitter.emit('server-error', err);
      }
    );

    startServer.catch(err => {
      eventEmitter.emit('server-log-error', 'Server bundle is invalid, server is not running');
      eventEmitter.emit('server-error', err);
    });
  });

  return {
    close() {
      if (runningServer) {
        return new Promise(resolve => runningServer.close(resolve));
      }

      return Promise.resolve();
    }
  };
}

module.exports = createHotServer;
