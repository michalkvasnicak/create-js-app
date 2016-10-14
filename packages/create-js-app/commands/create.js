/* eslint-disable no-console */
const chalk = require('chalk');
const spawn = require('cross-spawn');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const pathExists = require('path-exists');

module.exports = {
  command: 'create <path>',
  desc: 'Creates an empty project in specified directory using template',
  builder: {
    template: {
      alias: 't',
      default: 'js-app-template-universal',
      describe: 'Create project using a template',
      type: 'string',
    },
  },
  handler: (argv) => {
    const destinationPath = path.resolve(process.cwd(), argv.path);
    const projectName = path.basename(destinationPath);
    const template = argv.template;
    const templateDirectory = path.basename(template.replace(/@.+/, '')); // strip version

    if (pathExists.sync(destinationPath)) {
      console.log(
        chalk.red('I am sorry but you can\'t create a project in existing directory')
      );
      console.log();
      console.log(
        chalk.cyan('You can try it using init command ;) just run "create-js-app init --help" if you need help')
      );
      process.exit(1);
    }

    const packageJson = {
      name: projectName,
      version: '0.1.0',
      private: true,
    };

    try {
      fs.mkdirSync(destinationPath);

      // save package.json to this directory
      fs.writeFileSync(
        path.join(destinationPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // change current directory
      process.chdir(destinationPath);

      // now install template
      console.log(chalk.cyan('Installing template. This might take a couple minutes.'));
      console.log(chalk.cyan(`Installing ${template} from npm...`));
      console.log();

      let result = spawn.sync(
        'npm',
        [
          'install',
          '--save-dev',
          '--save-exact',
          template,
        ],
        { stdio: 'inherit' }
      );

      if (result.status !== 0) {
        throw new Error('Template installation failed');
      }

      // copy contents of template directory from node_modules to app folder
      fsExtra.copySync(
        path.join(destinationPath, 'node_modules', templateDirectory),
        destinationPath
      );

      // remove template dependency from node_modules and package.json
      fsExtra.removeSync(
        path.join(destinationPath, 'node_modules', templateDirectory)
      );

      const appPackageJsonPath = path.join(destinationPath, 'package.json');

      // load package.json
      const appPackageJson = JSON.parse(
        fs.readFileSync(appPackageJsonPath, { encoding: 'utf8' })
      );

      // remove template dependency
      delete appPackageJson.devDependencies[templateDirectory];

      // save package.json
      fs.writeFileSync(appPackageJsonPath, JSON.stringify(appPackageJson, null, 2));

      // if there is gitignore file, rename it
      const gitignorePath = path.join(destinationPath, 'gitignore');

      if (pathExists.sync(gitignorePath)) {
        fsExtra.renameSync(gitignorePath, path.join(destinationPath, '.gitignore'));
      }

      // find package.json from installed template
      // so we can copy dependencies
      const templatePackageJsonPath = path.join(
        destinationPath, 'package.json'
      );

      if (!pathExists.sync(templatePackageJsonPath)) {
        console.log(
          chalk.red(`package.json not found in ${templatePackageJsonPath}`)
        );
      }

      const templatePackageJson = JSON.parse(
        fs.readFileSync(templatePackageJsonPath, { encoding: 'utf8' })
      );

      // add dependencies from package.json
      packageJson.dependencies = templatePackageJson.dependencies || {};
      packageJson.devDependencies = templatePackageJson.devDependencies || {};
      packageJson.peerDependencies = templatePackageJson.peerDependencies || {};
      packageJson.scripts = templatePackageJson.scripts || {};

      fs.writeFileSync(
        templatePackageJsonPath,
        JSON.stringify(packageJson)
      );

      console.log(
        chalk.cyan('Installing template dependencies. This might take a couple minutes.')
      );
      console.log('Installing from npm...');
      console.log();

      result = spawn.sync('npm', ['install'], { stdio: 'inherit' });

      if (result.status !== 0) {
        console.log(chalk.red('Installation failed...'));
        process.exit(1);
      }

      // done, we don't install create-js-app-scripts here
      // because we are using templates, which can differ
      // only init command is installing create-js-app-scripts :)
      console.log(chalk.green(`Project ${projectName} successfully created`));
      console.log('');
      console.log(chalk.cyan('You can use these commands now:'));
      console.log('  - npm start - to start a development server');
      console.log('  - npm run build - to build a production build');
      console.log('  - npm test - to start testing');
      console.log('  - For more check commands defined by the template');
      console.log('');

      console.log(chalk.cyan('Happy hacking ;)'));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red('Error occurred:'));
      console.log(e);
      process.exit(1);
    }
  },
};
