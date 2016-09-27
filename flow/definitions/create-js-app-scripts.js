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
