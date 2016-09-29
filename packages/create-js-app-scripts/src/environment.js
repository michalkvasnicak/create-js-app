/* @flow */
const path = require('path');
const loadConfiguration = require('./utils/loadConfiguration');

class Environment {
  cwd: string;
  configFileName: string;
  plugins: Array<PluginController>;

  constructor(cwd: string, configFileName: string = '.app.js') {
    this.cwd = cwd;
    this.configFileName = configFileName;
  }

  configFilePath(): string {
    return path.resolve(this.cwd, this.configFileName);
  }

  getConfiguration(): Configuration {
    return loadConfiguration(this);
  }

  getName(): string {
    return this.getConfiguration().env.NODE_ENV;
  }

  async build(): Promise<any> {
    const config: Configuration = loadConfiguration(this);

    // run build phase on plugins (do not instantiate them)
    const pluginControllers: PluginController[] = await Promise.all(config.plugins.map(
      plugin => plugin(this, true)
    ));

    await Promise.all(pluginControllers.map(pluginController => pluginController.build()));
  }

  async start(): Promise<any> {
    const config: Configuration = loadConfiguration(this);

    // instantiate plugins
    this.plugins = await Promise.all(config.plugins.map(
      plugin => plugin(this, false)
    ));

    await Promise.all(this.plugins.map(p => p.start()));
  }

  async restart(): Promise<any> {
    // terminate all plugins
    await Promise.all(this.plugins.map(pluginController => pluginController.terminate()));

    // start all plugins
    await this.start();
  }
}

module.exports = Environment;
