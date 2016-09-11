/* @flow */

const webpack = require('webpack');
const clientConfigFactory = require('../config/webpack/client.config');

function clientCompiler(extendConfig /*: Object */, eventEmitter /*: events$EventEmitter */) /*: CompilerManager */ {
  const config = clientConfigFactory({ mode: 'development' }, extendConfig);

  const compiler = webpack(config);

  compiler.apply(new webpack.ProgressPlugin((percent, msg) => {
    eventEmitter.emit('client-progress', percent, msg);
  }));

  compiler.plugin('done', stats => {
    if (!stats.hasErrors() && !stats.hasWarnings()) {
      eventEmitter.emit('client-log-success', 'Build succeeded');
    } else if (stats.hasErrors()) {
      eventEmitter.emit('client-log-error', 'Build failed');
    } else if (stats.hasWarnings()) {
      eventEmitter.emit('client-log-warning', 'Build compiled with warnings');
    }

    eventEmitter.emit('client-done', stats);
  });

  return {
    compiler,

    close() {
      return new Promise(resolve => {
        compiler.close(resolve);
      });
    }
  }
}

module.exports = clientCompiler;
