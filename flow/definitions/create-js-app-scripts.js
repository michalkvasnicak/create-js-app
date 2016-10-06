/* @flow */

declare type ConfigurationEnvironment = Object & {
  NODE_ENV: string
}
declare type ConfigurationSettings = Object & {
  appNodeModulesDir: string,
  assetsPath: string,
  appSrc: string,
  babelrc: ?string,
  eslintrc: ?string
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
  getName(): string;
  start(): Promise<any>;
  build(): Promise<any>;
  restart(): Promise<any>;
  stop(): Promise<any>;
}

declare type Plugin = (env: Environment, runOnce: boolean, logger: Logger) => PluginController;

declare type PluginController = {
  build(): Promise<any>,
  start(): Promise<any>,
  terminate(): Promise<any>,
}

declare type ClientWebpackPluginConfiguration = Configuration & {
  settings: ConfigurationSettings & {
    client: {
      index: string,
      bundleDir: string,
    }
  }
}

declare type ServerWebpackPluginConfiguration = Configuration & {
  settings: ConfigurationSettings & {
    server: {
      index: string,
      bundleDir: string,
    }
  }
}

declare interface Logger {
  createGroup(name: string): LogGroup;
  removeGroup(name: string): void;
  render(): void;
}

declare interface LogGroup {
  clear(): void;
  constructor(name: string, logger: Logger): void;
  getMessages(): string;
  getName(): string;
  log(message: string): void;
  info(message: string): void;
  error(message: string): void;
  success(message: string): void;
  warning(message: string): void;
  remove(): void;
}
