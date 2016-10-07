#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const argv = process.argv.slice(2);
const package = argv[0];
const packageName = argv[1];
const packagePath = argv[2];

const packageJsonPath = path.join(package, argv[3] || 'package.json');
const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, { encoding: 'utf8' })
);

let changed = false;

if (packageJson.dependencies[packageName]) {
    changed = true;
    packageJson.dependencies[packageName] = `file:${packagePath}`;
}

if (packageJson.devDependencies[packageName]) {
    changed = true;
    packageJson.devDependencies[packageName] = `file:${packagePath}`;
}

changed && fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
