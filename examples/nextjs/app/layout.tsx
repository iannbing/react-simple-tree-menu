// Root Server Component. No "use client" here — the Sidebar wrapper is
// the only file that needs the directive, because that's where we touch
// the (client-only) TreeMenu.

import 'react-simple-tree-menu/styles';
import './globals.css';
import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';

export const metadata = {
  title: 'react-simple-tree-menu · Next.js App Router example',
  description: 'Dog-food example that uses react-simple-tree-menu inside the App Router.',
};

// Object-form data: the numeric `index` on each node orders siblings
// inside walk(). Required by the public TreeNode type.
const treeData = {
  docs: {
    label: 'Docs',
    index: 0,
    nodes: {
      'getting-started': { label: 'Getting Started', index: 0 },
      guides: {
        label: 'Guides',
        index: 1,
        nodes: {
          controlled: { label: 'Controlled vs. uncontrolled', index: 0 },
          search: { label: 'Search', index: 1 },
          keyboard: { label: 'Keyboard & a11y', index: 2 },
          theming: { label: 'Theming', index: 3 },
        },
      },
      api: { label: 'API Reference', index: 2 },
    },
  },
  examples: {
    label: 'Examples',
    index: 1,
    nodes: {
      nextjs: { label: 'Next.js App Router', index: 0 },
      react16: { label: 'React 16.14 baseline', index: 1 },
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <Sidebar data={treeData} />
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
