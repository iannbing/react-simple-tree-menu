# react-simple-tree-menu — React 16.14 baseline example

Smallest possible consumer pinned to the **oldest** React the library
supports: **16.14.0**. If this mounts and the tree works, the peer floor
holds.

> PLAN.md originally called for Create React App here. CRA was deprecated
> in 2023 and has reliability issues on Node 22; Vite with the automatic
> JSX runtime serves the same dog-food purpose and stays maintainable.

## Run it

```bash
# from the repo root
npm run build              # build the library once so file: link resolves

cd examples/react16
npm install
npm run dev                # http://localhost:3002
```

## What's verified

- Library consumes cleanly under **React 16.14** (the peer floor).
- `react/jsx-runtime` resolves (our source compiles with the automatic
  JSX runtime, which landed in 16.14).
- CSS subpath `react-simple-tree-menu/styles` resolves via the
  `exports` map.
