import { useState } from 'react';
import TreeMenu from 'react-simple-tree-menu';

// Object-form data: the numeric `index` on each node orders siblings
// inside walk(). Required by the public TreeNode type.
const treeData = {
  fruit: {
    label: 'Fruits',
    index: 0,
    nodes: {
      apple: { label: 'Apple', index: 0 },
      banana: { label: 'Banana', index: 1 },
      berry: {
        label: 'Berries',
        index: 2,
        nodes: {
          strawberry: { label: 'Strawberry', index: 0 },
          blueberry: { label: 'Blueberry', index: 1 },
        },
      },
    },
  },
  vegetable: {
    label: 'Vegetables',
    index: 1,
    nodes: {
      carrot: { label: 'Carrot', index: 0 },
      broccoli: { label: 'Broccoli', index: 1 },
    },
  },
};

export function App() {
  const [lastClicked, setLastClicked] = useState<string>('(none)');

  return (
    <div className="page">
      <header>
        <h1>react-simple-tree-menu · React 16.14 baseline</h1>
        <p>
          React version:{' '}
          <code>{/* eslint-disable-next-line */ (globalThis as any).React?.version ?? '16.14.x'}</code>
        </p>
      </header>
      <section className="demo">
        <TreeMenu data={treeData} onClickItem={(item) => setLastClicked(item.key)} />
      </section>
      <footer>
        Last clicked: <code>{lastClicked}</code>
      </footer>
    </div>
  );
}
