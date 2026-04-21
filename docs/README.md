# react-simple-tree-menu docs site

Astro + Starlight static docs for
[`react-simple-tree-menu`](https://github.com/iannbing/react-simple-tree-menu).

## Dev

```bash
cd docs
npm install
npm run dev
```

The Vite alias in `astro.config.mjs` points
`react-simple-tree-menu` at `../src/index.tsx`, so you get hot-reload on
library source changes without rebuilding.

## Build

```bash
npm run build
```

Output lands in `docs/dist/`. Deployed by `.github/workflows/docs.yml` to
GitHub Pages on push to `master`.
