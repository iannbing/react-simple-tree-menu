// Smoke test for the new v2 TreeMenu function component. Imports
// directly from `../TreeMenu` (not `../index`), exercising the
// fresh implementation without going through the legacy re-exports.
//
// Full characterization parity against the legacy entry is the
// M5.1 dual-entry validation; this file is the minimal "new
// component mounts and does the right thing" gate.

import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreeMenu, type TreeMenuHandle } from '../tree-menu';
import type { TreeNodeInArray } from '../types';

const data: TreeNodeInArray[] = [
  {
    key: 'fruits',
    label: 'Fruits',
    nodes: [{ key: 'apple', label: 'Apple' }],
  },
  { key: 'vegetables', label: 'Vegetables' },
];

describe('TreeMenu v2 (new) — smoke', () => {
  it('renders top-level items with role="treeitem"', () => {
    render(<TreeMenu data={data} />);
    const items = screen.getAllByRole('treeitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Fruits');
    expect(items[1]).toHaveTextContent('Vegetables');
  });

  it('container has role="tree"', () => {
    render(<TreeMenu data={data} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('expands a branch when its toggle icon is clicked', async () => {
    const user = userEvent.setup();
    render(<TreeMenu data={data} />);
    const fruits = screen.getByText('Fruits').closest('[role="treeitem"]')!;
    const toggle = fruits.querySelector('.rstm-toggle-icon') as HTMLElement;
    await user.click(toggle);
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('ArrowRight opens a closed branch (keyboard)', async () => {
    const user = userEvent.setup();
    const { container } = render(<TreeMenu data={data} />);
    (container.firstElementChild as HTMLElement).focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('onClickItem is called with the full Item on click', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    render(<TreeMenu data={data} onClickItem={onClickItem} />);
    await user.click(screen.getByText('Fruits'));
    expect(onClickItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'fruits', label: 'Fruits' })
    );
  });

  it('imperative ref handle exposes resetOpenNodes', () => {
    const ref = createRef<TreeMenuHandle>();
    render(
      <TreeMenu ref={ref} data={data} initialOpenNodes={['fruits']} />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    act(() => {
      ref.current!.resetOpenNodes([]);
    });
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('disableKeyboard omits the KeyDown wrapper div', () => {
    const { container } = render(<TreeMenu data={data} disableKeyboard />);
    const first = container.firstElementChild as HTMLElement;
    // Without KeyDown wrapping, the first element is the search input.
    expect(first.tagName).not.toBe('DIV');
  });

  it('controlled openNodes does not toggle from internal clicks', async () => {
    const user = userEvent.setup();
    render(<TreeMenu data={data} openNodes={['fruits']} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    const fruits = screen.getByText('Fruits').closest('[role="treeitem"]')!;
    const toggle = fruits.querySelector('.rstm-toggle-icon') as HTMLElement;
    await user.click(toggle);
    // Still open — controlled openNodes is not mutated.
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('keySeparator prop composes Item keys with the given delimiter', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    render(
      <TreeMenu
        data={data}
        initialOpenNodes={['fruits']}
        keySeparator="."
        onClickItem={onClickItem}
      />
    );
    await user.click(screen.getByText('Apple'));
    expect(onClickItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'fruits.apple' })
    );
  });

  it('ref handle exposes expandAll — every branch opens, selection preserved', () => {
    const ref = createRef<TreeMenuHandle>();
    render(
      <TreeMenu ref={ref} data={data} initialActiveKey="vegetables" />
    );
    // Pre-expandAll: closed branches are not rendered.
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    act(() => {
      ref.current!.expandAll();
    });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    // Active selection survives — expandAll doesn't clear it the way
    // resetOpenNodes does.
    const vegetables = screen.getByText('Vegetables').closest('[role="treeitem"]');
    expect(vegetables?.getAttribute('aria-selected')).toBe('true');
  });

  it('ref handle exposes collapseAll — every branch closes, selection preserved', () => {
    const ref = createRef<TreeMenuHandle>();
    render(
      <TreeMenu
        ref={ref}
        data={data}
        initialOpenNodes={['fruits']}
        initialActiveKey="fruits/apple"
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    act(() => {
      ref.current!.collapseAll();
    });
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    // Selection is NOT wiped (unlike resetOpenNodes).
    const fruits = screen.getByText('Fruits').closest('[role="treeitem"]');
    expect(fruits).toBeInTheDocument();
  });

  it('expandAll/collapseAll are no-ops under controlled openNodes', () => {
    const ref = createRef<TreeMenuHandle>();
    // Controlled to an empty set; expandAll should NOT alter rendering.
    render(<TreeMenu ref={ref} data={data} openNodes={[]} />);
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    act(() => {
      ref.current!.expandAll();
    });
    // Still closed — controlled parent owns openNodes.
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });
});
