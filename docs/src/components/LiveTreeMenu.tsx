// Live TreeMenu demo embedded throughout the docs as an Astro React island.
// Hydrated with `client:only="react"` so the static Astro build doesn't try
// to SSR the library.
//
// The demo is intentionally the same shape as the code snippet shown next
// to it on the landing page: the default UI with `initialOpenNodes` +
// `onClickItem`. Clicking a row activates it (fires onClickItem); clicking
// the ▸ disclosure icon toggles the branch. The small hint strip + aria-
// live "Last clicked" readout make that click contract visible to
// first-time visitors.

import { useState } from 'react';
import TreeMenu, { type Item } from 'react-simple-tree-menu';
import 'react-simple-tree-menu/styles';

type Variant = 'default' | 'headless';

interface Props {
  variant?: Variant;
}

const sampleTree = {
  fruit: {
    label: 'Fruits',
    nodes: {
      apple: { label: 'Apple' },
      banana: { label: 'Banana' },
      berry: {
        label: 'Berries',
        nodes: {
          strawberry: { label: 'Strawberry' },
          blueberry: { label: 'Blueberry' },
        },
      },
    },
  },
  vegetable: {
    label: 'Vegetables',
    nodes: {
      carrot: { label: 'Carrot' },
      broccoli: { label: 'Broccoli' },
    },
  },
  grain: {
    label: 'Grains',
    nodes: {
      rice: { label: 'Rice' },
      wheat: { label: 'Wheat' },
    },
  },
};

const headlessClasses = {
  group: 'demo-group',
  subgroup: 'demo-subgroup',
  item: 'demo-item',
  active: 'demo-item-active',
  focused: 'demo-item-focused',
  search: 'demo-search',
  toggleIcon: 'demo-toggle',
};

export default function LiveTreeMenu({ variant = 'default' }: Props) {
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const commonProps = {
    data: sampleTree,
    initialOpenNodes: ['fruit'],
    onClickItem: (item: Item) => setLastClicked(item.key),
  };

  return (
    // `not-content` opts the subtree out of Starlight's markdown-prose
    // rules — which otherwise add a vertical `margin-top` between every
    // adjacent block-level sibling, spreading the tree rows apart.
    <div className="rstm-live-demo not-content">
      {variant === 'headless' ? (
        <>
          <style>{headlessCss}</style>
          <TreeMenu {...commonProps} classNames={headlessClasses} />
        </>
      ) : (
        <TreeMenu {...commonProps} />
      )}
      <div className="rstm-live-demo-hint">
        <div className="rstm-live-demo-tips">
          <span>
            <strong>Mouse:</strong> click ▸ to expand · click a row to select
          </span>
          <span>
            <strong>Keys:</strong> <kbd>Tab</kbd> focuses · <kbd>↑</kbd>{' '}
            <kbd>↓</kbd> moves · <kbd>←</kbd> <kbd>→</kbd> collapse/expand ·{' '}
            <kbd>Enter</kbd> selects
          </span>
        </div>
        <span className="rstm-live-demo-last" aria-live="polite">
          {lastClicked ? (
            <>
              Last clicked: <code>{lastClicked}</code>
            </>
          ) : (
            <>Try clicking or tabbing into the tree</>
          )}
        </span>
      </div>
    </div>
  );
}

const headlessCss = `
.demo-group { background: transparent; }
.demo-item {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  transition: background 120ms ease;
}
.demo-item:hover { background: rgba(59, 130, 246, 0.1); }
.demo-item-active {
  background: #3b82f6 !important;
  color: white !important;
}
.demo-item-focused { box-shadow: inset 0 0 0 2px #93c5fd; }
.demo-search {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  margin-bottom: 8px;
}
.demo-search:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}
.demo-toggle { color: #64748b; }
`;
