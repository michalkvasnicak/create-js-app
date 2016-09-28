/* @flow */
/* eslint-disable no-console */

// set environment to production
process.env.NODE_ENV = 'production';

const chalk = require('chalk');
const Environment = require('./environment');

const env: Environment = new Environment(process.cwd());

env.build().then(
  () => {
    console.log(chalk.green('Successfully build'));
    process.exit(0);
  },
  (err) => {
    console.log(chalk.red('Build failed'));
    console.log(err);
    process.exit(1);
  }
);
