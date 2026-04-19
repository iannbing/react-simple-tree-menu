// Astro + Starlight config for the react-simple-tree-menu docs site.
//
// Two non-obvious choices:
// 1. `site` + `base` are set for GitHub Pages at /react-simple-tree-menu/.
//    When serving locally, paths still resolve because Astro handles the
//    base transparently in dev.
// 2. The Vite alias points `react-simple-tree-menu` at `../src/index.tsx`
//    directly. That gives docs authors hot-reload on library source changes
//    and avoids requiring a `npm run build` before `npm run dev` in docs/.

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';

const libraryRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  site: 'https://iannbing.github.io',
  base: '/react-simple-tree-menu',
  integrations: [
    react(),
    starlight({
      title: 'react-simple-tree-menu',
      description:
        'Simple, data-driven, zero-dependency tree menu component for React.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      favicon: '/favicon.svg',
      head: [
        // Preconnect + load the Inter display family (weights 400/500/600/700)
        // and JetBrains Mono for code. Subsetting to latin keeps the weight
        // low. Starlight will pick these up as the body/heading/mono stacks
        // via the `--sl-font` and `--sl-font-system-mono` overrides in
        // docs.css below.
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true,
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
          },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/iannbing/react-simple-tree-menu',
        },
      ],
      sidebar: [
        { label: 'Introduction', link: '/' },
        { label: 'Getting Started', link: '/getting-started/' },
        {
          label: 'Guides',
          items: [
            { label: 'Controlled vs. uncontrolled', link: '/guides/controlled/' },
            { label: 'Search', link: '/guides/search/' },
            { label: 'Keyboard & accessibility', link: '/guides/keyboard/' },
            { label: 'Custom render-props', link: '/guides/render-props/' },
            { label: 'Theming', link: '/guides/theming/' },
            { label: 'Next.js App Router', link: '/guides/nextjs/' },
            { label: 'Virtualization', link: '/guides/virtualization/' },
          ],
        },
        {
          label: 'API',
          items: [
            { label: 'TreeMenu', link: '/api/tree-menu/' },
            { label: 'Types', link: '/api/types/' },
          ],
        },
        { label: 'Migration v1 → v2', link: '/migration/v1-to-v2/' },
      ],
      customCss: ['./src/styles/docs.css'],
      components: {},
    }),
  ],
  vite: {
    resolve: {
      alias: {
        'react-simple-tree-menu/styles': `${libraryRoot}src/styles.css`,
        'react-simple-tree-menu': `${libraryRoot}src/index.tsx`,
      },
    },
    server: {
      fs: {
        // Allow serving files from the library root (one level up from docs/)
        // so the Vite alias above can resolve to ../src/*.
        allow: [libraryRoot],
      },
    },
  },
});
