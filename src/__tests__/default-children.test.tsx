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
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('omits the search input when search is absent', () => {
    render(defaultChildren({ items }));
    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
  });

  it('typing into the search input invokes the provided callback', async () => {
    const user = userEvent.setup();
    const search = vi.fn();
    render(defaultChildren({ items, search }));
    await user.type(screen.getByPlaceholderText('Search'), 'x');
    expect(search).toHaveBeenCalledWith('x');
  });

  it('renders each item as a treeitem', () => {
    render(defaultChildren({ items, search: () => {} }));
    const treeitems = screen.getAllByRole('treeitem');
    expect(treeitems).toHaveLength(items.length);
    expect(treeitems[0]).toHaveTextContent('Alpha');
    expect(treeitems[1]).toHaveTextContent('Bravo');
  });

  describe('classNames prop (M4.5c — headless Tailwind use)', () => {
    it('appends consumer classes alongside the rstm-* anchors', () => {
      render(
        defaultChildren({
          items,
          search: () => {},
          searchTerm: '',
          classNames: {
            group: 'my-ul',
            item: 'my-li',
            search: 'my-input',
          },
        })
      );
      const tree = screen.getByRole('tree');
      expect(tree.className).toContain('rstm-tree-item-group');
      expect(tree.className).toContain('my-ul');

      const input = screen.getByPlaceholderText('Search');
      expect(input.className).toContain('rstm-search');
      expect(input.className).toContain('my-input');

      for (const item of screen.getAllByRole('treeitem')) {
        expect(item.className).toContain('rstm-tree-item');
        expect(item.className).toContain('my-li');
      }
    });

    it('active/focused slot classes apply only to items in that state', () => {
      const itemsWithState: typeof items = [
        { ...items[0]!, active: true },
        { ...items[1]!, focused: true },
      ];
      render(
        defaultChildren({
          items: itemsWithState,
          search: () => {},
          classNames: { active: 'my-active', focused: 'my-focused' },
        })
      );
      const [first, second] = screen.getAllByRole('treeitem');
      expect(first!.className).toContain('my-active');
      expect(first!.className).not.toContain('my-focused');
      expect(second!.className).toContain('my-focused');
      expect(second!.className).not.toContain('my-active');
    });

    it('omitted classNames leave output byte-identical to the no-prop path', () => {
      const { container: withUndef } = render(
        defaultChildren({ items, search: () => {}, classNames: undefined })
      );
      const { container: withoutProp } = render(
        defaultChildren({ items, search: () => {} })
      );
      expect(withUndef.innerHTML).toBe(withoutProp.innerHTML);
    });
  });

  describe('labels prop (M4.5d)', () => {
    it('uses labels.searchPlaceholder and labels.searchAriaLabel when provided', () => {
      render(
        defaultChildren({
          items,
          search: () => {},
          labels: {
            searchPlaceholder: 'Suche…',
            searchAriaLabel: 'Baum durchsuchen',
          },
        })
      );
      const input = screen.getByLabelText('Baum durchsuchen') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe('Suche…');
    });

    it('falls back to English defaults when labels is omitted', () => {
      render(defaultChildren({ items, search: () => {} }));
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
    });

    it('partial labels object uses defaults for missing keys', () => {
      render(
        defaultChildren({
          items,
          search: () => {},
          labels: { searchPlaceholder: 'Rechercher…' },
        })
      );
      const input = screen.getByPlaceholderText('Rechercher…');
      // aria-label falls back to default
      expect(input.getAttribute('aria-label')).toBe('Search');
    });
  });

  it('search input clears when searchTerm resets externally', () => {
    // Simulate the lifecycle: committed searchTerm goes 'carrot' → ''
    // via a resetOpenNodes call on the parent. Input should track.
    const { rerender } = render(
      defaultChildren({ items, search: () => {}, searchTerm: 'carrot' })
    );
    const input = screen.getByPlaceholderText(
      'Search'
    ) as HTMLInputElement;
    expect(input.value).toBe('carrot');

    rerender(defaultChildren({ items, search: () => {}, searchTerm: '' }));
    expect(input.value).toBe('');
  });
});
