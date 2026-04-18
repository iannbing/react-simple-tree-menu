// Forward suite. These tests assert v2-only behavior — WAI-ARIA tree
// pattern, roving tabindex, SSR safety. They are **red against legacy**
// (marked with `.fails`) and will turn green incrementally as new modules
// land in M4–M5.
//
// TDD discipline: when a test starts passing (i.e., M4 adds the behavior),
// vitest will alert us via "expected to fail but passed" and we remove the
// `.fails` marker. No implementation commit merges without this step.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeMenu, { type TreeNodeInArray } from '../index';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const data: TreeNodeInArray[] = [
  {
    key: 'fruits',
    label: 'Fruits',
    nodes: [{ key: 'apple', label: 'Apple' }],
  },
  { key: 'vegetables', label: 'Vegetables' },
];

// ---------------------------------------------------------------------------
// WAI-ARIA tree pattern
// ---------------------------------------------------------------------------

describe('ARIA tree pattern (red until M4.1/M4.2)', () => {
  it.fails('container has role="tree"', () => {
    render(<TreeMenu data={data} />);
    // Legacy renders a bare <ul class="rstm-tree-item-group"> with no role.
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it.fails('items have role="treeitem"', () => {
    render(<TreeMenu data={data} />);
    // Legacy renders <li role="button">.
    const treeitems = screen.getAllByRole('treeitem');
    expect(treeitems.length).toBeGreaterThan(0);
  });

  it.fails('nodes with children have aria-expanded matching open state', () => {
    render(<TreeMenu data={data} />);
    const fruits = screen.getByText('Fruits').closest('li')!;
    expect(fruits.getAttribute('aria-expanded')).toBe('false');
  });

  it.fails('items have aria-level reflecting 1-based depth', () => {
    render(<TreeMenu data={data} initialOpenNodes={['fruits']} />);
    const fruits = screen.getByText('Fruits').closest('li')!;
    const apple = screen.getByText('Apple').closest('li')!;
    expect(fruits.getAttribute('aria-level')).toBe('1');
    expect(apple.getAttribute('aria-level')).toBe('2');
  });

  it.fails('items have aria-setsize and aria-posinset', () => {
    render(<TreeMenu data={data} />);
    const fruits = screen.getByText('Fruits').closest('li')!;
    expect(fruits.getAttribute('aria-setsize')).toBe('2');
    expect(fruits.getAttribute('aria-posinset')).toBe('1');
  });

  it.fails('active items have aria-selected="true"', () => {
    render(<TreeMenu data={data} initialActiveKey="fruits" />);
    const fruits = screen.getByText('Fruits').closest('li')!;
    expect(fruits.getAttribute('aria-selected')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Roving tabindex (new)
// ---------------------------------------------------------------------------

describe('roving tabindex (red until M4.1)', () => {
  it.fails('focused item has tabIndex=0, others have tabIndex=-1', () => {
    render(<TreeMenu data={data} initialFocusKey="vegetables" />);
    const fruits = screen.getByText('Fruits').closest('li')!;
    const vegetables = screen.getByText('Vegetables').closest('li')!;
    expect(vegetables.getAttribute('tabindex')).toBe('0');
    expect(fruits.getAttribute('tabindex')).toBe('-1');
  });
});

// ---------------------------------------------------------------------------
// SSR safety
// ---------------------------------------------------------------------------

describe('SSR safety', () => {
  it('renderToString produces stable HTML containing the top-level labels', async () => {
    const { renderToString } = await import('react-dom/server');
    const html = renderToString(<TreeMenu data={data} />);
    expect(html).toContain('Fruits');
    expect(html).toContain('Vegetables');
  });

  it('does not touch window/document during render (guarded by jsdom absence)', async () => {
    // We can't fully excise `document` in jsdom, but we can assert that
    // renderToString (which runs without a DOM mutation phase) succeeds —
    // which is what Next.js App Router cares about. A future M4.9 will
    // harden this with a true "no-DOM" Node test via a separate test file.
    const { renderToString } = await import('react-dom/server');
    expect(() => renderToString(<TreeMenu data={data} />)).not.toThrow();
  });
});
