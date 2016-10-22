/* @flow */
process.env.NODE_ENV = 'test';

const jest = require('jest');
const path = require('path');
const pathExists = require('path-exists');
const argv = process.argv.slice(2);

// Watch unless on CI
if (!process.env.CI) {
  argv.push('--watch');
}

const rootDir = process.cwd();
const setupTestsFile = pathExists.sync(path.resolve(rootDir, './src/setupTests.js'))
  ? '<rootDir>/src/setupTests.js'
  : undefined;

argv.push('--config', JSON.stringify({
  rootDir,
  moduleFileExtensions: ['jsx', 'js', 'json'],
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve('./jest/file.stub.js'),
    '^.+\\.css$': require.resolve('./jest/css.stub.js'),
  },
  scriptPreprocessor: require.resolve('./jest/transform.js'),
  setupFiles: [/* require.resolve('./jest/polyfills.js') */],
  setupTestFrameworkScriptFile: setupTestsFile,
  testPathIgnorePatterns: ['<rootDir>/(build|docs|node_modules)/'],
  testEnvironment: argv.indexOf('--node') !== -1 ? 'node' : 'jsdom',
  testRegex: argv.indexOf('--node') !== -1
    ? '(/__tests_node__/.*|\\.(test\\.node|spec\\.node))\\.(js|jsx)$'
    : '(/__tests__/.*|\\.(test|spec))\\.(js|jsx)$',
}));

jest.run(argv);
