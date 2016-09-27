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
    return path.resolve(`${this.cwd}, ${this.configFileName}`);
  }

  getConfiguration(): Configuration {
    return loadConfiguration(this);
  }

  async build(): Promise<any> {
    const config: Configuration = loadConfiguration(this);

    // run build phase on plugins (do not instantiate them)
    await config.plugins.map(
      plugin => plugin(this, true)
    );
  }

  start(): void {
    const config: Configuration = loadConfiguration(this);

    // instantiate plugins
    this.plugins = config.plugins.map(
      plugin => plugin(this, false)
    );
  }

  async restart(): Promise<any> {
    // terminate all plugins
    await this.plugins.map(pluginController => pluginController.terminate());

    // start all plugins
    this.start();
  }
}

module.exports = Environment;