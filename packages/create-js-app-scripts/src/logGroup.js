/* @flow */
const chalk = require('chalk');

class LogGroup {
  logger: Logger;
  messages: Array<string>;
  name: string;

  constructor(name: string, logger: Logger) {
    this.name = name;
    this.logger = logger;
    this.messages = [];
  }

  clear(): void {
    this.messages = [];
    this.logger.render();
  }

  log(message: string): void {
    this.messages.push(message);
    this.logger.render();
  }

  info(message: string): void {
    this.log(chalk.cyan(message));
  }

  success(message: string): void {
    this.log(chalk.green(message));
  }

  warning(message: string): void {
    this.log(chalk.yellow(message));
  }

  error(message: string): void {
    this.log(chalk.red(message));
  }

  getMessages(): Array<string> {
    return this.messages;
  }

  getName(): string {
    return this.name;
  }

  remove(): void {
    this.logger.removeGroup(this.name);
  }
}

module.exports = LogGroup;
