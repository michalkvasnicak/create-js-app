/* @flow */
const fs = require('fs');

module.exports = class AssetsPlugin {
  assetsPath: string;
  env: Environment;

  constructor(env: Environment) {
    this.env = env;
    this.assetsPath = env.getConfiguration().settings.assetsPath;
  }

  apply(compiler: Object): void {
    compiler.plugin('done', (stats) => {
      const publicPath = compiler.options.output.publicPath;

      const json = stats.toJson();
      const entryPoints = {};

      json
        .chunks
        .reverse()
        .filter(chunk => chunk.initial)
        .forEach((chunk) => {
          let map;

          if (entryPoints[chunk.names[0]]) {
            map = entryPoints[chunk.names[0]];
          } else {
            map = entryPoints[chunk.names[0]] = { css: [], js: [] };
          }

          const files = Array.isArray(chunk.files) ? chunk.files : [chunk.files];

          files.forEach((file) => {
            const filePath = publicPath + file;

            if (/\.js$/.test(file)) {
              map.js.push(filePath);
            } else if (/\.css$/.test(file)) {
              map.css.push(filePath);
            }
          });

          return entryPoints;
        }, {});

      fs.writeFileSync(this.assetsPath, JSON.stringify(entryPoints));
    });
  }
};
