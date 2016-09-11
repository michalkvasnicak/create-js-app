/* @flow */

const webpack = require('webpack');
const serverConfigFactory = require('../config/webpack/server.config');

function serverCompiler(extendConfig /*: Object */, eventEmitter /*: events$EventEmitter */) /*: CompilerManager */ {
  const config = serverConfigFactory({ mode: 'development' }, extendConfig);

  const compiler = webpack(
    Object.assign(
      {},
      config,
      {
        watchOptions: {
          ignored: /node_modules/
        }
      }
    )
  );

  compiler.apply(new webpack.ProgressPlugin((percent, msg) => {
    eventEmitter.emit('server-progress', percent, msg);
  }));

  compiler.plugin('done', stats => eventEmitter.emit('server-done', stats));

  compiler.watch({}, () => {});

  return {
    compiler,

    close() {
      return new Promise(resolve => {
        compiler.close(resolve);
      });
    }
  }
}

module.exports = serverCompiler;
