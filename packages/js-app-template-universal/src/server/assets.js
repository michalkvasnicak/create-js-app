/* @flow */

type AssetsMap = {|
  scripts: string[],
  styles: string[]
|};

type Chunk = {
  css: [string],
  js: [string]
};

import fs from 'fs';
import { ASSETS_PATH } from './config';

let loadedAssets = {};

try {
  loadedAssets = JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf8'));
} catch (e) {
  // do nothing
}

const chunks: Chunk[] = Object.keys(loadedAssets).map(key => loadedAssets[key]);
const assets = chunks.reduce((acc: AssetsMap, chunk: Chunk) => {
  if (chunk.js) {
    acc.scripts.push(...chunk.js);
  }
  if (chunk.css) {
    acc.styles.push(...chunk.css);
  }
  return acc;
}, { scripts: [], styles: [] });

export default assets;

