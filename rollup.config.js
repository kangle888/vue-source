import path from 'path';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import resolvePlugin from '@rollup/plugin-node-resolve';

const packagesDir = path.resolve(__dirname, 'packages');

// 获取所有包的目录
const packageDir = path.resolve(packagesDir, process.env.TARGET);

console.log('packageDir', packageDir);
// 获取所有包的目录
const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve('package.json'));
const packageOptions = pkg.buildOptions || {};

const name = path.basename(packageDir);

console.log('packageOptions', packageOptions);

const outputConfigs = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`
  },
  "cjs": {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`
  },
  "global": {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`
  }
};

const createConfig = (format, output) => {
  output.name = packageOptions.name;
  output.sourcemap = true;
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin()
    ]
  };
}

export default packageOptions.formats.map(format => createConfig(format, outputConfigs[format]));