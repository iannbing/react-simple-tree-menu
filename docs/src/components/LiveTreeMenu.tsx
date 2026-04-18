// Live TreeMenu demo embedded throughout the docs as an Astro React island.
// Hydrated with `client:only="react"` so the static Astro build doesn't try
// to SSR the library (the internal `useDeferredValue` feature-detect runs
// at module scope and is safe, but we still want to avoid the SSR pass
// flicker on the static site).

import TreeMenu from 'react-simple-tree-menu';
import 'react-simple-tree-menu/styles';

type Variant = 'default' | 'headless';

interface Props {
  variant?: Variant;
}

const sampleTree = {
  'fruit': {
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
  'vegetable': {
    label: 'Vegetables',
    nodes: {
      carrot: { label: 'Carrot' },
      broccoli: { label: 'Broccoli' },
    },
  },
  'grain': {
    label: 'Grains',
    nodes: {
      rice: { label: 'Rice' },
      wheat: { label: 'Wheat' },
    },
  },
};

// Minimal Tailwind-like utility classes that don't actually need Tailwind
// installed — they're all wired via our docs.css + scoped plain CSS below.
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
  return (
    <div className="rstm-live-demo">
      {variant === 'headless' ? (
        <>
          <style>{headlessCss}</style>
          <TreeMenu data={sampleTree} classNames={headlessClasses} />
        </>
      ) : (
        <TreeMenu data={sampleTree} />
      )}
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
