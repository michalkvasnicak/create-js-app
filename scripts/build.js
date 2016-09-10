const dotenv = require('dotenv');
const chalk = require('chalk');
const path = require('path');
const pathExists = require('path-exists');
const webpack = require('webpack');

const createClientConfig = require('./config/webpack/client.config');
const createServerConfig = require('./config/webpack/server.config');

const currentDirectory = process.cwd();

dotenv.config({ silent: true });

// load configuration
const configPath = path.resolve(currentDirectory, './.app.js');
let config = {};

if (pathExists.sync(configPath)) {
  config = require(configPath);
  config.eslint = path.resolve(currentDirectory, config.eslint);
  config.tasks = Array.isArray(config.tasks) ? config.tasks : [];
}

console.log('Creating an optimized production build...');

// compile client
webpack(createClientConfig({ mode: 'production' }), (err, stats) => {
  if (err) {
    console.error('Failed to create a client production build. Reason:');
    console.error(err.message || err);
    process.exit(1);
  }

  console.log(chalk.green('Client compiled successfully'));
});

// compile server
webpack(createServerConfig({ mode: 'production' }), (err, stats) => {
  if (err) {
    console.error('Failed to create a server production build. Reason:');
    console.error(err.message || err);
    process.exit(1);
  }

  console.log(chalk.green('Server compiled successfully'));
});
