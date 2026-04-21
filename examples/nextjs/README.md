# react-simple-tree-menu — Next.js App Router example

Dog-food consumer that renders a `<TreeMenu>` inside a Next.js 15 App
Router client component. Verifies the library works with React 19, RSC
boundaries, and Next's ESM resolution.

## Run it

```bash
# from the repo root
npm run build              # build the library once so file: link resolves

cd examples/nextjs
npm install
npm run dev                # http://localhost:3001
```

## Structure

- `app/layout.tsx` — Server Component. Imports the library CSS, prepares
  plain JSON tree data, and renders the shell.
- `app/sidebar.tsx` — Client Component (`"use client"`). Owns the
  `<TreeMenu>`.
- `app/page.tsx` — Server Component landing page.

The `"use client"` directive is scoped to the one file that actually
needs it. Data flows server → client as a plain JSON prop, which is the
recommended App Router pattern.
