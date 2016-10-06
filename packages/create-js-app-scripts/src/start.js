/* @flow */
/* eslint-disable no-console */
// set environment to development
process.env.NODE_ENV = 'development';

const fs = require('fs');
const Environment = require('./environment');
const Logger = require('./logger');

const env: Environment = new Environment(
  fs.realpathSync(process.cwd()),
  undefined,
  new Logger()
);

process.on('SIGINT', () => {
  env.stop();
});

env.start().catch(
  (e) => {
    console.log(e);
    process.exit(1);
  }
);
