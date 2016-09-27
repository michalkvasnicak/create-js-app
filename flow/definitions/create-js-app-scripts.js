/* @flow */

declare type ConfigurationEnvironment = Object
declare type ConfigurationSettings = Object & {
  appNodeModulesDir: string
}

declare type Configuration = {
  env: ConfigurationEnvironment,
  plugins: Array<Plugin>,
  settings: ConfigurationSettings
}

declare interface Environment {
  cwd: string;
  configFileName: string;
  plugins: Array<PluginController>;

  constructor(cwd: string, configFilePath: string): void;
  configFilePath(): string;
  getConfiguration(): Configuration;
  start(): void;
  build(): Promise<any>;
  restart(): Promise<any>;
}

declare type Plugin = (env: Environment, runOnce: boolean) => PluginController;

declare type PluginController = {
  terminate(): Promise<any>,
}

declare type ClientWebpackPluginConfiguration = Configuration & {
  settings: ConfigurationSettings & {
    client: {
      babelrc: ?string,
      eslintrc: ?string,
      indexJs: string,
      buildDir: string,
      srcDir: string,
    }
  }
}

declare type ServerWebpackPluginConfiguration = Configuration & {
    settings: ConfigurationSettings & {
      server: {
        babelrc: ?string,
        eslintrc: ?string,
        indexJs: string,
        buildDir: string,
        srcDir: string,
      }
    }
  }
