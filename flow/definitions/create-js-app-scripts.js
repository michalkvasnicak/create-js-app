/* @flow */

declare type Configuration = {
  plugins: Array<Plugin>
}

declare interface Environment {
  cwd: string;
  configFileName: string;
  plugins: Array<PluginController>;

  constructor(cwd: string, configFilePath: string): void;
  configFilePath(): string;
  start(): void;
  build(): Promise<any>;
  restart(): Promise<any>;
}

declare type Plugin = (env: Environment, runOnce: boolean) => PluginController;

declare type PluginController = {
  terminate(): Promise<any>,
}
