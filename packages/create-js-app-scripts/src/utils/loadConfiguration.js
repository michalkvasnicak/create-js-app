/* @flow */

const path = require('path');

const defaultConfig = {
  env: {},
  plugins: [
    require('../plugins/watchConfiguration'), // eslint-disable-line global-require
  ],
  settings: {
    appNodeModulesDir: path.resolve(process.cwd(), './node_modules'),
  },
};

module.exports = function loadConfiguration(env: Environment): Configuration {
  try {
    const configModulePath = env.configFilePath();

    // first clean up require cache so we always load fresh config
    delete require.cache[configModulePath];
    const config = require(configModulePath); // eslint-disable-line global-require

    return {
      env: {
        ...defaultConfig.env,
        ...(config.env || {}),
      },
      plugins: [
        ...defaultConfig.plugins,
        ...(config.plugins || []),
      ],
      settings: {
        ...defaultConfig.settings,
        ...config.settings,
      },
    };
  } catch (e) {
    return defaultConfig;
  }
};

module.exports.defaultConfig = defaultConfig;
