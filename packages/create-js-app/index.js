#!/usr/bin/env node
/* eslint-disable no-unused-expressions, no-console, global-require */

const yargs = require('yargs');
const createCommand = require('./commands/create');

yargs
.usage('Usage: $0 <cmd> [args]')
.command(createCommand)
.help()
.version('version', 'display version information', require('./package.json').version)
.argv;
