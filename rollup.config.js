import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const name = 'RollupTypeScriptBabel';

export default {
  input: './src/index.tsx',
  external: ['react', 'react-dom'],

  plugins: [
    del({ targets: 'dist/*' }),
    // Allows node_modules resolution
    resolve({ extensions }),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),

    typescript(),
    // Compile TypeScript/JavaScript files
    babel({ extensions, include: ['src/**/*'] }),
  ],

  output: [
    {
      file: pkg.module,
      format: 'esm',
    },
    {
      file: pkg.main,
      format: 'cjs',
    },
  ],
};
