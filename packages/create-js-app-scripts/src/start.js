/* @flow */
// set environment to development
process.env.NODE_ENV = 'development';

const fs = require('fs');
const Environment = require('./environment');

const env: Environment = new Environment(fs.realpathSync(process.cwd()));

env.start();
