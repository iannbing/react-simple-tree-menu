// Custom render-props variants, side-by-side. Proves that both common
// rendering strategies — flat with `level`-driven indent, and a manually
// reconstructed nested <ul>/<li>/<ul> — keep working against the v2 API.
//
// The `items` array passed into render-props is always flat. What's up to
// the consumer is how they render it.

import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, MouseEventHandler, ReactElement } from 'react';
import TreeMenu from './index';
import type { TreeMenuItem, TreeNodeInArray } from './types';

// Visual focus ring. KeyDown (on the outer wrapper) captures arrow keys
// and dispatches focus state; browser focus stays on the wrapper while
// `item.focused` is what marks the "current" row. Without a style for
// `item.focused`, arrow-key navigation runs silently and the user sees
// nothing move — that's the bug the previous revision of this file had.
const rowStyle = (item: TreeMenuItem, base: CSSProperties): CSSProperties => ({
  ...base,
  background: item.active ? '#6366f1' : undefined,
  color: item.active ? 'white' : undefined,
  boxShadow: item.focused ? 'inset 0 0 0 2px #818cf8' : undefined,
  outline: 'none',
});

const data: TreeNodeInArray[] = [
  {
    key: 'fruit',
    label: 'Fruits',
    nodes: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
      {
        key: 'berry',
        label: 'Berries',
        nodes: [
          { key: 'strawberry', label: 'Strawberry' },
          { key: 'blueberry', label: 'Blueberry' },
        ],
      },
    ],
  },
  {
    key: 'vegetable',
    label: 'Vegetables',
    nodes: [
      { key: 'carrot', label: 'Carrot' },
      { key: 'broccoli', label: 'Broccoli' },
    ],
  },
];

const meta: Meta<typeof TreeMenu> = {
  title: 'TreeMenu/Render-props',
  component: TreeMenu,
};
export default meta;
type Story = StoryObj<typeof TreeMenu>;

// --- Variant 1 -------------------------------------------------------------
// Flat <ul> with inline paddingLeft driven by item.level. Simplest
// custom render and the one shown in the README.
// --------------------------------------------------------------------------

export const Flat: Story = {
  name: 'Flat list (README example)',
  render: () => (
    <div style={{ width: 280 }}>
      <TreeMenu data={data} initialOpenNodes={['fruit', 'fruit/berry']}>
        {({ search, items }) => (
          <>
            {search && (
              <input
                onChange={(e) => search(e.target.value)}
                placeholder="Search..."
                style={{ width: '100%', padding: '6px 10px', marginBottom: 8 }}
              />
            )}
            <ul
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
              role="tree"
            >
              {items.map((item) => (
                // Keyboard events are handled by the outer KeyDown wrapper
                // the library injects around our render-prop output.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <li
                  key={item.key}
                  role="treeitem"
                  aria-level={item.level + 1}
                  aria-selected={!!item.active}
                  aria-expanded={item.hasNodes ? item.isOpen : undefined}
                  // Roving tabindex: focused row is 0, everyone else is -1.
                  tabIndex={item.focused ? 0 : -1}
                  style={rowStyle(item, {
                    paddingLeft: 10 + item.level * 18,
                    paddingTop: 4,
                    paddingBottom: 4,
                    cursor: 'pointer',
                  })}
                  onClick={item.onClick}
                >
                  {item.hasNodes ? (item.isOpen ? '\u25BE ' : '\u25B8 ') : ''}
                  {item.label}
                </li>
              ))}
            </ul>
          </>
        )}
      </TreeMenu>
    </div>
  ),
};

// --- Variant 2 -------------------------------------------------------------
// Nested <ul>/<li>/<ul> reconstructed from the flat items[]. Same pattern
// defaultChildren uses internally — parses the slash-joined key to find
// each item's parent, then renders depth-first.
// --------------------------------------------------------------------------

interface Grouped {
  roots: TreeMenuItem[];
  byParent: Map<string, TreeMenuItem[]>;
}

function unflatten(items: TreeMenuItem[]): Grouped {
  const roots: TreeMenuItem[] = [];
  const byParent = new Map<string, TreeMenuItem[]>();
  for (const item of items) {
    const slash = item.key.lastIndexOf('/');
    if (slash === -1) {
      roots.push(item);
    } else {
      const parent = item.key.slice(0, slash);
      const siblings = byParent.get(parent);
      if (siblings) siblings.push(item);
      else byParent.set(parent, [item]);
    }
  }
  return { roots, byParent };
}

function renderNode(
  item: TreeMenuItem,
  byParent: Map<string, TreeMenuItem[]>
): ReactElement {
  const children = byParent.get(item.key);
  return (
    <li
      key={item.key}
      role="treeitem"
      aria-level={item.level + 1}
      aria-selected={!!item.active}
      aria-expanded={item.hasNodes ? item.isOpen : undefined}
      tabIndex={item.focused ? 0 : -1}
    >
      {/* Visual row — sibling of the nested <ul> below. Keeping
          onClick + focus styling here (not on the <li>) means a click on a
          child's row doesn't also fire the ancestor row's onClick. Same
          reason the library's ItemComponent uses an inner row <div>. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        style={rowStyle(item, { padding: '4px 10px', cursor: 'pointer' })}
        onClick={item.onClick as unknown as MouseEventHandler<HTMLDivElement>}
      >
        {item.hasNodes ? (item.isOpen ? '\u25BE ' : '\u25B8 ') : ''}
        {item.label}
      </div>
      {children && children.length > 0 && (
        <ul
          role="group"
          style={{ listStyle: 'none', margin: 0, paddingLeft: 18 }}
        >
          {children.map((c) => renderNode(c, byParent))}
        </ul>
      )}
    </li>
  );
}

export const Nested: Story = {
  name: 'Nested ul/li/ul (reconstructed)',
  render: () => (
    <div style={{ width: 280 }}>
      <TreeMenu data={data} initialOpenNodes={['fruit', 'fruit/berry']}>
        {({ search, items }) => {
          const { roots, byParent } = unflatten(items);
          return (
            <>
              {search && (
                <input
                  onChange={(e) => search(e.target.value)}
                  placeholder="Search..."
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    marginBottom: 8,
                  }}
                />
              )}
              <ul
                role="tree"
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                {roots.map((r) => renderNode(r, byParent))}
              </ul>
            </>
          );
        }}
      </TreeMenu>
    </div>
  ),
};
