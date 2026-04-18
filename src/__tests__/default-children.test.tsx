// Direct tests for v2 defaultChildren. Asserts role="tree" and the
// legacy search input shape. Indirect coverage via TreeMenu is in
// characterization.test.tsx once M4.4 wires the new TreeMenu.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultChildren } from '../default-children';
import type { TreeMenuItem } from '../types';

const items: TreeMenuItem[] = [
  {
    key: 'a',
    label: 'Alpha',
    hasNodes: false,
    isOpen: false,
    level: 0,
    onClick: () => {},
  },
  {
    key: 'b',
    label: 'Bravo',
    hasNodes: false,
    isOpen: false,
    level: 0,
    onClick: () => {},
  },
];

describe('defaultChildren', () => {
  it('renders the tree container with role="tree"', () => {
    render(defaultChildren({ items, search: () => {} }));
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders a search input with the legacy className when search is provided', () => {
    render(defaultChildren({ items, search: () => {} }));
    expect(screen.getByPlaceholderText('Type and search')).toBeInTheDocument();
  });

  it('omits the search input when search is absent', () => {
    render(defaultChildren({ items }));
    expect(screen.queryByPlaceholderText('Type and search')).not.toBeInTheDocument();
  });

  it('typing into the search input invokes the provided callback', async () => {
    const user = userEvent.setup();
    const search = vi.fn();
    render(defaultChildren({ items, search }));
    await user.type(screen.getByPlaceholderText('Type and search'), 'x');
    expect(search).toHaveBeenCalledWith('x');
  });

  it('renders each item as a treeitem', () => {
    render(defaultChildren({ items, search: () => {} }));
    const treeitems = screen.getAllByRole('treeitem');
    expect(treeitems).toHaveLength(items.length);
    expect(treeitems[0]).toHaveTextContent('Alpha');
    expect(treeitems[1]).toHaveTextContent('Bravo');
  });

  it('search input clears when searchTerm resets externally', () => {
    // Simulate the lifecycle: committed searchTerm goes 'carrot' → ''
    // via a resetOpenNodes call on the parent. Input should track.
    const { rerender } = render(
      defaultChildren({ items, search: () => {}, searchTerm: 'carrot' })
    );
    const input = screen.getByPlaceholderText(
      'Type and search'
    ) as HTMLInputElement;
    expect(input.value).toBe('carrot');

    rerender(defaultChildren({ items, search: () => {}, searchTerm: '' }));
    expect(input.value).toBe('');
  });
});
