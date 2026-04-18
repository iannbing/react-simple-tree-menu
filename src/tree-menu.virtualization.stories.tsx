// Virtualization recipe as a runnable Storybook story. Proves the
// docs/guides/virtualization.mdx recipe compiles and renders, and that
// TreeMenu + react-window compose via the render-props API without a
// runtime dependency.
//
// react-window is a **devDependency** here for Storybook only — it's
// never shipped to consumers; the recipe is something they install and
// wire up themselves. See the guide for the full explanation.

import type { Meta, StoryObj } from '@storybook/react';
import type { MouseEventHandler } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import TreeMenu from './index';
import type { TreeMenuItem, TreeNodeInArray } from './types';
import './styles.css';

const ROW_HEIGHT = 32;

// Build a tree big enough that virtualization pays off (~3k visible items
// when fully expanded). At that scale, mounting all rows at once is a
// noticeable frame; react-window keeps us at ~15 visible rows regardless.
function makeTree(size: number, fan: number): TreeNodeInArray[] {
  let id = 0;
  const makeNode = (depthRemaining: number): TreeNodeInArray => {
    const node: TreeNodeInArray = { key: `n${id++}`, label: `Item ${id}` };
    if (depthRemaining > 0 && id < size) {
      node.nodes = [];
      for (let i = 0; i < fan && id < size; i++) {
        node.nodes.push(makeNode(depthRemaining - 1));
      }
    }
    return node;
  };
  const roots: TreeNodeInArray[] = [];
  while (id < size) roots.push(makeNode(8));
  return roots;
}

const bigTree = makeTree(3_000, 4);

function Row({ index, style, data }: ListChildComponentProps<TreeMenuItem[]>) {
  const item = data[index]!;
  return (
    // Keyboard nav: real apps would hook key handlers into the row (or,
    // better, wrap the list in a KeyDown-style manager that scrolls
    // virtualized items into view). The recipe here focuses on the
    // virtualization shape; wire up whatever key model you need.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      role="treeitem"
      tabIndex={item.focused ? 0 : -1}
      aria-level={item.level + 1}
      aria-selected={!!item.active}
      style={{
        ...style,
        paddingLeft: 12 + item.level * 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        background: item.active ? '#6366f1' : undefined,
        color: item.active ? 'white' : undefined,
      }}
      // TreeMenuItem.onClick is typed for <li>; this row is a <div>.
      // The event object's shape is identical in practice — only the
      // currentTarget's element type narrows. Cast rather than wrap to
      // keep the recipe compact.
      onClick={item.onClick as unknown as MouseEventHandler<HTMLDivElement>}
    >
      {item.hasNodes && (
        // Ornamental mouse-only toggle — keyboard nav is covered at the
        // TreeMenu wrapper level.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <span
          onClick={(e) => {
            e.stopPropagation();
            item.toggleNode?.();
          }}
          style={{ width: 14 }}
        >
          {item.isOpen ? '\u25BE' : '\u25B8'}
        </span>
      )}
      <span>{item.label}</span>
    </div>
  );
}

const meta: Meta<typeof TreeMenu> = {
  title: 'TreeMenu/Virtualization',
  component: TreeMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Composes `<TreeMenu>` with `react-window` via render-props. ' +
          'No runtime dependency on react-window — consumers opt in.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TreeMenu>;

export const ReactWindow: Story = {
  render: () => (
    <div role="tree" style={{ width: 360 }}>
      <TreeMenu data={bigTree}>
        {({ items, search }) => (
          <>
            {search && (
              <input
                onChange={(e) => search(e.target.value)}
                placeholder="Search 3,000 items..."
                className="rstm-search"
              />
            )}
            <FixedSizeList
              height={480}
              itemCount={items.length}
              itemSize={ROW_HEIGHT}
              width={360}
              itemData={items}
            >
              {Row}
            </FixedSizeList>
          </>
        )}
      </TreeMenu>
    </div>
  ),
};
