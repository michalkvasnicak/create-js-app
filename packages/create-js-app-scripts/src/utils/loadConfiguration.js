/* @flow */

const defaultConfig = {
  plugins: [
    require('../plugins/watchConfiguration'), // eslint-disable-line global-require
  ],
};

module.exports = function loadConfiguration(env: Environment): Configuration {
  try {
    const configModulePath = env.configFilePath();

    // first clean up require cache so we always load fresh config
    delete require.cache[configModulePath];
    const config = require(configModulePath); // eslint-disable-line global-require

    return {
      ...defaultConfig,
      ...config,
      plugins: [].concat(defaultConfig.plugins, config.plugins || []),
    };
  } catch (e) {
    return defaultConfig;
  }
};

module.exports.defaultConfig = defaultConfig;
