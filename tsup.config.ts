// Bundler config: emits ESM + CJS + `.d.ts`. Sourcemaps ship to npm
// for library debuggability; consumer prod bundlers strip them.
// React / react-dom are marked `external` so they never land in the
// published bundle — consumers supply their own peer.
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    main: 'src/index.tsx',
  },
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.esm.js' : '.cjs.js',
  }),
  dts: {
    entry: { index: 'src/index.tsx' },
  },
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  splitting: false,
  minify: false,
});
