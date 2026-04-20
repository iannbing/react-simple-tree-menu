// Live TreeMenu demo embedded throughout the docs as an Astro React island.
// Hydrated with `client:only="react"` so the static Astro build doesn't try
// to SSR the library (the internal `useDeferredValue` feature-detect runs
// at module scope and is safe, but we still want to avoid the SSR pass
// flicker on the static site).
//
// Interaction model for the demo (not the library default):
//   - Clicking a branch row toggles it (file-explorer UX). First-time
//     visitors expect click-to-expand and would otherwise think the
//     component doesn't respond to the label.
//   - Clicking a leaf fires `onClickItem` and updates a little
//     "Last clicked" readout below the tree so the interaction is
//     visibly confirmed.
//   - The disclosure triangle still toggles the way the library ships
//     by default.

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

// Minimal utility classes for the headless variant — wired via scoped
// plain CSS below so we don't need Tailwind installed in docs/.
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
  const [openNodes, setOpenNodes] = useState<string[]>(['fruit']);
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const handleClickItem = (item: Item) => {
    setLastClicked(item.key);
    if (item.hasNodes) {
      setOpenNodes((prev) =>
        prev.includes(item.key)
          ? prev.filter((k) => k !== item.key)
          : [...prev, item.key]
      );
    }
  };

  const tree =
    variant === 'headless' ? (
      <>
        <style>{headlessCss}</style>
        <TreeMenu
          data={sampleTree}
          classNames={headlessClasses}
          openNodes={openNodes}
          onClickItem={handleClickItem}
        />
      </>
    ) : (
      <TreeMenu
        data={sampleTree}
        openNodes={openNodes}
        onClickItem={handleClickItem}
      />
    );

  return (
    <div className="rstm-live-demo">
      {tree}
      <div className="rstm-live-demo-hint">
        <span>
          <strong>Tip:</strong> click a branch to expand · click a leaf to select
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
