/* @flow */

const Environment = require('./environment');

// set environment to development
process.env.NODE_ENV = 'development';

const env: Environment = new Environment(process.cwd());

env.start();
