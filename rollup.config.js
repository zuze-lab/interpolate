import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
import pkg from './package.json';

const MAIN = 'src/index.js';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

export default [
  // ES5
  {
    input: MAIN,
    output: {
      file: 'build/cjs/index.js',
      format: 'cjs',
    },
    external,
    plugins: [
      resolve({
        customResolveOptions: { moduleDirectory: 'src' },
      }),
      babel({
        plugins: ['@babel/transform-runtime'],
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['> 1%', 'last 2 versions'],
              },
            },
          ],
        ],
        runtimeHelpers: true,
      }),
    ],
  },

  // MODULE
  {
    input: MAIN,
    output: {
      file: 'build/esm/index.js',
      format: 'esm',
    },
    external,
    plugins: [resolve()],
  },

  // BROWSER
  {
    input: MAIN,
    plugins: [sourcemaps()],
    output: [
      {
        file: 'build/bundle.min.js',
        sourcemap: true,
        format: 'iife',
        name: 'interpolate',
        plugins: [terser()],
      },
    ],
  },
];
