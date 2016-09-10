/* @flow */
'use strict';

const dotenv = require('dotenv');
const path = require('path');
const pathExists = require('path-exists');

const renderDashboard = require('./dashboard');
const currentDirectory /*: string */ = process.cwd();
const webpackServerCompiler /*: Function */ = require('./webpack/server');
const webpackClientCompiler /*: Function */ = require('./webpack/client');
const createHotClient /*: Object */ = require('./server/createHotClient');
const createHotServer /*: Object */ = require('./server/createHotServer');
const EventEmitter = require('events');

const dashboardEventEmitter = new EventEmitter;

dotenv.config({ silent: true });

function start(config, eventEmitter) {
  const clientCompiler = webpackClientCompiler(config, eventEmitter);
  const serverCompiler = webpackServerCompiler(config, eventEmitter);
  const clientManager = createHotClient(clientCompiler.compiler, eventEmitter);
  const serverManager = createHotServer(serverCompiler.compiler, eventEmitter);

  return {
    terminate() {
      return Promise.all([
        clientManager.close(),
        serverManager.close(),
        clientCompiler.close(),
        serverCompiler.close()
      ]);
    }
  };
}

const configPath = path.resolve(currentDirectory, './.app.js');
let config = {};

if (pathExists.sync(configPath)) {
  config = require(configPath);
  config.eslint = path.resolve(currentDirectory, config.eslint);
  config.tasks = Array.isArray(config.tasks) ? config.tasks : [];
}

let manager = start(config, dashboardEventEmitter);

// run tasks
config.tasks.forEach(task => task(dashboardEventEmitter));

// todo watch for .app.js changes and restart whole compilers

// clean up on termination
process.on('SIGTERM', () => {
  if (manager) {
    manager.terminate().then(() => process.exit(0));
  }
});

renderDashboard(dashboardEventEmitter);
