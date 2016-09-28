/* @flow */
const chokidar = require('chokidar');
const path = require('path');

function createUpdater(env: Environment) {
  return (filePath: string) => { // eslint-disable-line no-unused-vars
    // restart environment (terminates all plugins and loads them again)
    env.restart();
  };
}

/**
 * Watches configuration file and restarts build on change
 *
 * @param {Object} env
 * @param {boolean} runOnce   run only once (used in build script)
 */
const plugin: Plugin = (env: Environment, runOnce: boolean = false): PluginController => {
  if (runOnce) {
    return {
      async build() {
        return Promise.resolve();
      },
      async terminate() {
        return true;
      },
    };
  }

  const updater = createUpdater(env);

  // start chokidar and watch for .app.js changes
  // everytime configuration changes, restart whole build
  const watcher = chokidar.watch(
    `${path.resolve(env.cwd, './.app.js')}`,
    {
      cwd: env.cwd,
    }
  );

  watcher.on('ready', () => {
    ['add', 'change', 'unlink'].forEach(event => watcher.on(event, updater));
  });

  return {
    async build() {
      return Promise.resolve();
    },
    async terminate() {
      watcher.close();
    },
  };
};

module.exports = plugin;
