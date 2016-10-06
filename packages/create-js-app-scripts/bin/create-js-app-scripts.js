#!/usr/bin/env node
/* eslint-disable no-console */
const chalk = require('chalk');
const spawn = require('cross-spawn');
const script = process.argv[2];
const args = process.argv.slice(3);

switch (script) {
  case 'build':
  case 'start':
  case 'test': {
    const result = spawn.sync(
      'node',
      [require.resolve(`../build/${script}`)].concat(args),
      { stdio: 'inherit' }
    );
    process.exit(result.status);
    break;
  }
  default:
    console.log(chalk.red(`Unknown script '${script}'.`));
    console.log(chalk.red('Perhaps you need to update react-scripts?'));
    process.exit(1);
    break;
}
