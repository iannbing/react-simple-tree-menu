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
