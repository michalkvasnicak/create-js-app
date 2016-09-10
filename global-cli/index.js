#!/usr/bin/env node

/**
 * This file is highly influenced by create-react-app global-cli (https://github.com/facebookincubator/create-react-app)
 */

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const config = require('./package.json');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const pathExists = require('path-exists');
const semver = require('semver');
const spawn = require('cross-spawn');

const $$commands = argv._;

if ($$commands.length === 0) {
  if (argv.version) {
    console.log(`create-js-app version: ${config.version}`);
    process.exit();
  }

  console.error('Usage create-js-app init|<project-directory> --verbose');
  process.exit(1);
}

/**
 * Checks node version and terminates process if version is not matching node version from package.json
 */
function checkNodeVersion() {
  if (!semver.satisfies(process.version, config.engines.node)) {
    console.error(
      chalk.red(
        `You are currently running Node %s but create-js-app requires %s. Please use a supported version of Node.\n`
      ),
      process.version,
      config.engines.node
    );

    process.exit(1);
  }
}

/**
 * Installs create-js-app-scripts in current directory
 */
function installPackage() {
  const args = ['install', '--save-dev', '--save-exact', 'create-js-app-scripts'];

  console.log('Installing packages. This might take a couple minutes.');
  console.log('installing create-js-app-scripts from npm...');
  console.log();

  const proc = spawn('npm', args, { stdio: 'inherit' });

  proc.on('close', code => {
    if (code !== 0) {
      console.error(`npm ${args.join(' ')} failed`);
      return;
    }

    console.log(chalk.green('Application successfully initialized. Run `npm start` to start development'));
  });
}

/**
 * Creates js app in given directory
 *
 * @param {String} path
 */
function create(path) {
  const root = path.resolve(path);

  if (!pathExists.sync(path)) {
    fs.mkdirSync(root);
  }

  const appName = path.basename(root);
  console.log(`Creating a new js app in ${root}.`);
  console.log();

  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  process.chdir(root);

  installPackage();
}

/**
 * Initializes create-js-app-scripts in current directory
 */
function init() {
  console.log(chalk.yellow('Detecting package.json'));

  const exists = pathExists.sync(path.resolve(process.cwd(), 'package.json'));

  if (!exists) {
    console.log('Package.json not found, creating.');
    create(process.cwd());
  } else {
    installPackage();
  }
}

/**
 * Runs command based on arguments
 *
 * @param {Array.<String>} commands
 */
function run(commands) {
  checkNodeVersion();

  if (commands[0] === 'init') {
    // run init command with arguments
    init();
  } else {
    // run create command with arguments
    create(commands);
  }
}

run($$commands);
