/* @flow */
/* eslint-disable global-require, no-console */
const fs = require('fs-extra');
const openBrowser = require('react-dev-utils/openBrowser');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const configurations = {
  client: {
    development: require('./config/client/development'),
    production: require('./config/client/production'),
  },
  server: {
    development: require('./config/server/development'),
    production: require('./config/server/production'),
  },
};

function createRunOnceCompiler(webpackConfig: Object): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      webpack(webpackConfig, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

const plugin: Plugin = (
  env: Environment,
  runOnce: boolean = false,
  logger: Logger
): PluginController => {
  let clientLogger;
  let serverLogger;
  const { env: envVariables, settings } = env.getConfiguration();
  let serverCompiler;
  let clientDevServer;

  return {
    async build() {
      clientLogger = logger.createGroup('client');
      serverLogger = logger.createGroup('server');
      const clientConfig = configurations.client[env.getName()](env, clientLogger);
      const serverConfig = configurations.server[env.getName()](env, serverLogger);

      fs.removeSync(settings.client.bundleDir);
      fs.removeSync(settings.server.bundleDir);

      const compilers = [
        createRunOnceCompiler(clientConfig),
        createRunOnceCompiler(serverConfig),
      ];

      return await Promise.all(compilers);
    },

    async start() {
      clientLogger = logger.createGroup('client');
      serverLogger = logger.createGroup('server');
      const clientConfig = configurations.client[env.getName()](env, clientLogger);
      const serverConfig = configurations.server[env.getName()](env, serverLogger);

      return new Promise((resolve, reject) => {
        try {
          const clientCompiler = webpack(clientConfig);

          clientDevServer = new WebpackDevServer(clientCompiler, {
            clientLogLevel: 'none',
            contentBase: envVariables.PUBLIC_DIR,
            historyApiFallback: {
              disableDotRule: true,
            },
            https: settings.client.protocol === 'https',
            host: 'localhost',
            hot: true,
            proxy: {
              '!(/__webpack_hmr|**/*.*)': `http://localhost:${envVariables.SERVER_PORT}`,
            },
            publicPath: '/',
            quiet: true,
            watchOptions: {
              ignored: /node_modules/,
            },
          });

          clientDevServer.listen(envVariables.SERVER_PORT - 1, (err) => {
            if (err) {
              console.log(err);
              return reject(err);
            }

            return openBrowser(
              `${settings.client.protocol || 'http'}://localhost:${envVariables.SERVER_PORT - 1}/`
            );
          });

          serverCompiler = webpack({
            ...serverConfig,
            watchOptions: {
              ignored: /node_modules/,
            },
          }).watch({}, () => {});
        } catch (e) {
          reject(e);
        }

        resolve();
      });
    },

    async terminate() {
      clientLogger.remove();
      serverLogger.remove();

      if (serverCompiler) {
        return Promise.all([
          new Promise(resolve => serverCompiler.close(resolve)),
          new Promise(resolve => clientDevServer.close(resolve)),
        ]);
      }

      return true;
    },
  };
};

module.exports = plugin;
