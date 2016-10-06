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

      const assetsByChunkName = json.assetsByChunkName;

      // get chunks that has dependencies
      const dependentChunks = json.chunks.filter(chunk => chunk.parents.length > 0);

      const dependencies = dependentChunks
        .reduce(
          (assets, chunk) => {
            const name = chunk.names[0];
            const acc = assets;

            if (!assets[name]) {
              acc[name] = {
                css: [],
                js: [],
              };
            }

            // if chunks has parents, add parents first, then chunks
            chunk.parents.forEach((parent) => {
              let assetsInChunk = assetsByChunkName[json.chunks[parent].names[0]];

              if (!Array.isArray(assetsInChunk)) {
                assetsInChunk = [assetsInChunk];
              }

              assetsInChunk.forEach((asset) => {
                if (/\.js$/.test(asset)) {
                  acc[name].js.push(publicPath + asset);
                } else if (/\.css$/.test(asset)) {
                  acc[name].css.push(publicPath + asset);
                }
              });
            });

            (chunk.files || []).forEach((asset) => {
              if (/\.js$/.test(asset)) {
                acc[name].js.push(publicPath + asset);
              } else if (/\.css$/.test(asset)) {
                acc[name].css.push(publicPath + asset);
              }
            });

            return acc;
          }, {}
        );

      fs.writeFileSync(this.assetsPath, JSON.stringify(dependencies));
    });
  }
};
