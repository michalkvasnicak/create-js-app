/* @flow */
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const toposort = require('toposort');

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
      const initialChunks = json.chunks.filter(chunk => chunk.initial);
      const chunks = {};
      const entryPoints = {};

      initialChunks.forEach((chunk) => {
        chunks[chunk.id] = chunk;
      });

      const edges = [];

      initialChunks.forEach((chunk) => {
        if (chunk.parents) {
          // Add an edge for each parent (parent -> child)
          chunk.parents.forEach((parentId) => {
            const parentChunk = chunks[parentId];
            // If the parent chunk does not exist (e.g. because of an excluded chunk)
            // we ignore that parent
            if (parentChunk) {
              edges.push([parentChunk, chunk]);
            }
          });
        }
      });

      const sorted = toposort.array(initialChunks, edges);

      sorted.forEach((chunk) => {
        let map;

        if (!entryPoints[chunk.names[0]]) {
          map = entryPoints[chunk.names[0]] = { css: [], js: [] };
        } else {
          map = entryPoints[chunk.names[0]];
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
      });

      // create build directory just in case
      fsExtra.mkdirsSync(path.dirname(this.assetsPath));
      fs.writeFileSync(this.assetsPath, JSON.stringify(entryPoints));
    });
  }
};
