const test = require('ava');
const loadConfiguration = require('../loadConfiguration');

test('loadConfiguration: returns default configuration if config file does not exist', (t) => {
  const config = loadConfiguration({
    configFilePath() {
      return `${__dirname}/.app.js`;
    },
  });

  t.deepEqual(
    config,
    loadConfiguration.defaultConfig
  );
});

test('loadConfiguration: returns merged configuration if config file exists', (t) => {
  const config = loadConfiguration({
    configFilePath() {
      return `${__dirname}/.testconfig.js`;
    },
  });

  t.deepEqual(
    config,
    {
      ...loadConfiguration.defaultConfig,
      test: true,
    }
  );
});
