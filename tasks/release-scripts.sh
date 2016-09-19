#!/usr/bin/env bash

# go to global-cli
cd "$(dirname "$0")/../"

# bump version
npm version "$@" -m "Release %s version"

root_path=$PWD

set -e
set -x

# Create a temporary clean folder that contains production only code.
clean_path=`mktemp -d 2>/dev/null || mktemp -d -t 'clean_path'`

rsync -av --exclude='.git' --exclude=$clean_path \
    --exclude='.idea' \
    --exclude='node_modules' --exclude='global-cli' \
    --exclude='flow' --exclude='tasks' \
    --exclude='.eslintrc.js' \
    --exclude='.editorconfig' \
    --exclude='.flowconfig' \
    './' $clean_path >/dev/null

cd $clean_path

# Update deps
rm -rf node_modules
rm -rf ~/.npm
npm cache clear
npm install
npm dedupe

rm -rf node_modules/fsevents

node $root_path/node_modules/.bin/bundle-deps

npm publish

cd ..
rm -rf $clean_path
