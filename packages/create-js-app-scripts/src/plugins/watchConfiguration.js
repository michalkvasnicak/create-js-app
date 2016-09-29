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
const plugin: Plugin = (env: Environment/* , runOnce: boolean = false */): PluginController => {
  const updater = createUpdater(env);
  let watcher;

  return {
    async build() {
      return Promise.resolve();
    },

    async start() {
      return new Promise((resolve, reject) => {
        // start chokidar and watch for .app.js changes
        // everytime configuration changes, restart whole build
        watcher = chokidar.watch(
          `${path.resolve(env.cwd, './.app.js')}`,
          {
            cwd: env.cwd,
          }
        );

        watcher.on('ready', () => {
          ['add', 'change', 'unlink'].forEach(event => watcher.on(event, updater));
          resolve();
        });

        watcher.on('error', (error) => {
          reject(error);
        });
      });
    },

    async terminate() {
      watcher.close();
    },
  };
};

module.exports = plugin;
