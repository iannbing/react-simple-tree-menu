// Demonstrates the Tailwind-v4-aware theming chain from SPEC §15.
//
// Each story decorates the TreeMenu with a different set of CSS variables
// to show how the library picks them up via the default `var()` chain.
// Non-Tailwind consumers see the hex fallbacks; Tailwind v4 users get
// brand-aligned colors automatically because Tailwind auto-exposes every
// theme value as a `:root` CSS variable.

import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import TreeMenu from './index';
import './styles.css';

const data = [
  {
    key: 'drinks',
    label: 'Drinks',
    nodes: [
      { key: 'coffee', label: 'Coffee' },
      { key: 'tea', label: 'Tea' },
    ],
  },
  {
    key: 'food',
    label: 'Food',
    nodes: [
      { key: 'bread', label: 'Bread' },
      { key: 'cheese', label: 'Cheese' },
    ],
  },
];

const frameStyle: CSSProperties = {
  maxWidth: 320,
  margin: '1rem',
  border: '1px solid #eee',
};

const meta: Meta<typeof TreeMenu> = {
  title: 'TreeMenu/Theming',
  component: TreeMenu,
  args: { data, initialOpenNodes: ['drinks'], initialActiveKey: 'drinks/coffee' },
};

export default meta;
type Story = StoryObj<typeof TreeMenu>;

// --- 1. Default ------------------------------------------------------------
// No theme vars defined anywhere. The library's hex fallbacks kick in.

export const DefaultPalette: Story = {
  decorators: [
    (Story) => (
      <div style={frameStyle}>
        <Story />
      </div>
    ),
  ],
};

// --- 2. Tailwind v4 simulation --------------------------------------------
// We define `--color-primary` and a few `--color-*` variables at the root of
// the frame, simulating what Tailwind v4 does automatically at `:root`.
// Observe: the active item's background now matches the simulated primary.

const tailwindV4Simulation: CSSProperties = {
  ...frameStyle,
  // v4 auto-exposes every theme value; here's a slice of common ones.
  // @ts-expect-error — CSS custom props aren't in CSSProperties typing.
  '--color-primary': '#8b5cf6', // violet-500
  '--color-white': '#fff',
  '--color-gray-300': '#d1d5db',
  '--color-gray-800': '#1f2937',
  '--color-gray-900': '#111827',
};

export const TailwindV4Theme: Story = {
  decorators: [
    (Story) => (
      <div style={tailwindV4Simulation}>
        <Story />
      </div>
    ),
  ],
};

// --- 3. Per-token override ------------------------------------------------
// The consumer doesn't need to touch Tailwind vars at all. They can set any
// single `--rstm-*` token on the tree element or an ancestor.

const perTokenOverride: CSSProperties = {
  ...frameStyle,
  // @ts-expect-error — CSS custom props aren't in CSSProperties typing.
  '--rstm-active-bg': '#ef4444', // red-500
  '--rstm-active-fg': '#fff7ed', // orange-50
  '--rstm-border-color': '#fde68a', // amber-200
};

export const PerTokenOverride: Story = {
  decorators: [
    (Story) => (
      <div style={perTokenOverride}>
        <Story />
      </div>
    ),
  ],
};

// --- 4. Headless with Tailwind utilities (M4.5c) --------------------------
// No CSS imported for this demo; `classNames` injects utility strings onto
// each rstm-* anchor. Shown here with mock-class strings so the story
// renders in Storybook without a Tailwind build. In a real Tailwind app
// these would be `py-3 px-4 cursor-pointer`, etc.

export const HeadlessClassNames: Story = {
  args: {
    ...meta.args,
    classNames: {
      group: 'demo-group',
      item: 'demo-item',
      active: 'demo-item--active',
      focused: 'demo-item--focused',
      search: 'demo-search',
      toggleIcon: 'demo-toggle-icon',
    },
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          .demo-group { list-style: none; padding: 0; border: 1px solid #e5e7eb; }
          .demo-item { padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
          .demo-item--active { background: #8b5cf6; color: white; }
          .demo-item--focused { box-shadow: 0 0 0 2px #6d28d9 inset; }
          .demo-search { padding: 0.75rem 1rem; width: 100%; border: 1px solid #e5e7eb; }
          .demo-toggle-icon { display: inline-block; width: 1.5rem; }
        `}</style>
        <div style={{ maxWidth: 320, margin: '1rem' }}>
          <Story />
        </div>
      </>
    ),
  ],
};
