#!/usr/bin/env node
/* eslint-disable no-unused-expressions, no-console, global-require */

const yargs = require('yargs');

yargs
.usage('Usage: $0 <cmd> [args]')
.commandDir('commands')
.help()
.version('version', 'display version information', require('./package.json').version)
.argv;
