// Live TreeMenu demo embedded throughout the docs as an Astro React island.
// Hydrated with `client:only="react"` so the static Astro build doesn't try
// to SSR the library.
//
// Interaction model for the demo:
//   - `openNodes` stays UNCONTROLLED — the library owns its own state,
//     so the disclosure triangle toggles natively (clicking ▸/▾ works
//     regardless of any onClickItem logic).
//   - A render-props wrapper decorates each item's onClick so clicking
//     a branch label ALSO toggles the branch (file-explorer UX). The
//     library ships with "label = activate" semantics by default; this
//     demo layers "label also expands" on top without changing the
//     library itself.
//   - A small hint strip + aria-live "Last clicked" readout make the
//     click contract visible to first-time visitors.

import { useState } from 'react';
import TreeMenu, {
  defaultChildren,
  type Item,
  type TreeMenuChildren,
  type TreeMenuItem,
} from 'react-simple-tree-menu';
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

  // Render-props wrapper that:
  //   1. Tracks label clicks for the "Last clicked" readout below.
  //   2. Also calls `toggleNode()` on branches so a label click
  //      expands / collapses (file-explorer UX). The native disclosure
  //      icon still toggles via the library's default click handler —
  //      the two paths do not conflict because `toggleNode` is
  //      idempotent with respect to the item's current open state.
  const renderWithClickToExpand: TreeMenuChildren = (props) => {
    const decorated: TreeMenuItem[] = props.items.map((item) => {
      const originalClick = item.onClick;
      const toggle = item.toggleNode;
      return {
        ...item,
        onClick: (e) => {
          setLastClicked(item.key);
          originalClick(e);
          if (item.hasNodes && toggle) toggle();
        },
      };
    });
    return defaultChildren({ ...props, items: decorated });
  };

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
          <TreeMenu {...commonProps} classNames={headlessClasses}>
            {renderWithClickToExpand}
          </TreeMenu>
        </>
      ) : (
        <TreeMenu {...commonProps}>{renderWithClickToExpand}</TreeMenu>
      )}
      <div className="rstm-live-demo-hint">
        <span>
          <strong>Tip:</strong> click a branch to expand · click ▸ to toggle · click a leaf to select
        </span>
        <span className="rstm-live-demo-last" aria-live="polite">
          {lastClicked ? (
            <>
              Last clicked: <code>{lastClicked}</code>
            </>
          ) : (
            <>Try clicking an item</>
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
