/* @flow */
/* eslint-disable no-console */
const path = require('path');

class ServerManager {
  logger: LogGroup;
  server: ?net$Server;
  socketId: number;
  sockets: { [key: string]: net$Socket };

  constructor() {
    this.socketId = 0;
    this.sockets = {};
  }

  async manage(server: ?net$Server) {
    if (this.server) {
      await this.close();
    }

    this.server = server;

    if (!this.server) {
      this.logger.error('Server bundle did not export a http listener');
      this.logger.info('Please export a http listener using `export default` syntax');

      throw new Error('Server bundle did not export a http listener.');
    } else if (typeof this.server.on !== 'function') {
      const message = 'Cannot attach connection handler to listener because it is missing an `on` method';
      this.logger.error(message);

      throw new Error(message);
    }

    this.server.unref();

    // listen to all connections so we can destroy them on restart
    this.server.on('connection', (socket: net$Socket) => {
      socket.unref();

      const socketId = this.socketId = this.socketId + 1;
      this.sockets[socketId] = socket;

      socket.on('close', () => delete this.sockets[socketId]);
    });
  }

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  async close() {
    if (this.server) {
      Object.keys(this.sockets).forEach((socketId) => {
        const socket = this.sockets[socketId];
        socket.destroy();
      });
      this.sockets = {};

      await new Promise(resolve => this.server.close(resolve));

      this.server = null;
    }
  }
}

const sharedServerManager = new ServerManager();

module.exports = class ServerListenerPlugin {
  env: Environment;
  logger: LogGroup;
  serverManager: Object;

  constructor(env: Environment, logger: LogGroup, serverManager = sharedServerManager) {
    this.env = env;
    this.logger = logger;
    this.serverManager = serverManager;

    this.serverManager.setLogger(logger);

    process.on('SIGINT', () => {
      this.serverManager.close();
    });
  }

  apply(compiler: Object): void {
    compiler.plugin('done', async (stats) => {
      const bundleName = this.logger.getName();

      if (stats.hasErrors()) {
        this.logger.error(`Bundle "${bundleName}" compiled with errors, keeping previous server instance running`);
        return;
      }

      // Clear out all files from this build
      Object.keys(require.cache).forEach((modulePath) => {
        if (modulePath.indexOf(compiler.options.output.path) === 0) {
          delete require.cache[modulePath];
        }
      });

      const serverBuildPath = path.resolve(
        compiler.options.output.path,
        compiler.options.output.filename
      );

      await this.serverManager.close();

      // start server
      try {
        // const shouldOpenBrowser = !this.runningServer;

        const server = require(serverBuildPath).default; // eslint-disable-line global-require, max-len

        await this.serverManager.manage(server);

        const port = this.env.getConfiguration().env.SERVER_PORT;
        const url = `http://localhost:${port}`;

        this.logger.info(`\tServer is listening on ${url}`);
      } catch (e) {
        this.logger.error('Error during server bundle start/restart');
        this.logger.log(e);

        throw e;
      }
    });
  }
};
