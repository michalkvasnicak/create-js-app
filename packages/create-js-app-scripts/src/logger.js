/* @flow */
/* eslint-disable no-console */
const clearConsole = require('react-dev-utils/clearConsole');
const LogGroup = require('./logGroup');

class Logger {
  groups: Array<LogGroup>;

  constructor() {
    this.groups = [];
  }

  createGroup(name: string): LogGroup {
    if (this.groups.find(group => group.getName() === name)) {
      throw new Error(`Log group "${name}" already exists`);
    }

    const group = new LogGroup(name, this);
    this.groups.push(group);

    return group;
  }

  removeGroup(name: string): void {
    this.groups = this.groups.filter(group => group.getName() !== name);
    this.render();
  }

  /**
   * Renders logs to console
   */
  render() {
    clearConsole();

    this.groups.forEach((group: LogGroup) => {
      if (!group.getMessages().length) {
        return;
      }

      group.getMessages().forEach(
        (message) => {
          console.log(message);
          console.log(); // aesthetics
        }
      );

      // aesthetic
      console.log('');
    });
  }
}

module.exports = Logger;
