#!/usr/bin/env bash

cd "$(dirname "$0")"

function cleanup {
  echo 'Cleaning up.'
  cd $root_path
  rm -rf test-app
}

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

function replace_package {
    ./tasks/replace-package.sh $*
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# substitute paths to packages to local directories
cd ..
root_path=$PWD

# install dependencies
npm install

# bootstrap packages ( this will build them )
lerna bootstrap

# run lint
npm run lint

# run flow
npm run flow
lerna run flow

# now substitute paths to packages
babel_preset_js_app=$(./tasks/resolve-package.sh babel-preset-js-app)
create_js_app_scripts=$(./tasks/resolve-package.sh create-js-app-scripts)
eslint_config_js_app=$(./tasks/resolve-package.sh eslint-config-js-app)
js_app_plugin_universal_webpack=$(./tasks/resolve-package.sh js-app-plugin-universal-webpack)
js_app_template_universal=$(./tasks/resolve-package.sh js-app-template-universal)

replace_package $create_js_app_scripts babel-preset-js-app $babel_preset_js_app
replace_package $js_app_plugin_universal_webpack babel-preset-js-app $babel_preset_js_app
replace_package $js_app_template_universal eslint-config-js-app $eslint_config_js_app
replace_package $js_app_template_universal eslint-config-js-app $eslint_config_js_app  package.dist.json
replace_package $js_app_template_universal create-js-app-scripts $create_js_app_scripts
replace_package $js_app_template_universal create-js-app-scripts $create_js_app_scripts package.dist.json
replace_package $js_app_template_universal js-app-plugin-universal-webpack $js_app_plugin_universal_webpack
replace_package $js_app_template_universal js-app-plugin-universal-webpack $js_app_plugin_universal_webpack package.dist.json

# echo every command
set -x

# create application using create command
node packages/create-js-app/index.js create test-app --template=$js_app_template_universal

# go to project dir
cd test-app

# lint project
npm run lint

# try to flow type check
npm run flow
lerna run flow

# run tests
CI=true npm test
CI=true lerna run test

# try to build production build
npm run build

# cleanup
cleanup
