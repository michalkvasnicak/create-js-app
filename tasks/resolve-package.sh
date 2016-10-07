#!/usr/bin/env node

const path = require('path');
const argv = process.argv.slice(2);

console.log(path.resolve(process.cwd(), 'packages', argv[0]));
