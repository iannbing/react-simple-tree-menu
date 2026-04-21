// Direct tests for the new v2 ItemComponent. These run against the new
// module in isolation — TreeMenu still routes to legacy's ItemComponent
// through the strangulation window, so the TreeMenu-level forward tests
// (`forward.test.tsx`) stay `.fails` until M5 cutover.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemComponent } from '../item-component';
import type { TreeMenuItem } from '../types';

// Key omitted on purpose — spreading `key` into JSX triggers a React
// warning; ItemComponent doesn't render it anyway.
const baseItem = {
  label: 'Fruits',
  hasNodes: true,
  isOpen: false,
  level: 0,
  onClick: () => {},
} as const;

const renderIn = (
  props: Partial<
    TreeMenuItem & {
      posInSet?: number;
      setSize?: number;
      active?: boolean;
      focused?: boolean;
    }
  >
) =>
  render(
    <ul>
      <ItemComponent
        {...(baseItem as unknown as TreeMenuItem)}
        {...(props as object)}
      />
    </ul>
  );

describe('ItemComponent (new, direct) — SPEC §12', () => {
  it('renders an <li> with role="treeitem"', () => {
    renderIn({});
    expect(screen.getByRole('treeitem')).toBeInTheDocument();
  });

  it('emits aria-expanded matching isOpen when hasNodes', () => {
    const { rerender } = renderIn({ isOpen: false });
    expect(screen.getByRole('treeitem').getAttribute('aria-expanded')).toBe('false');
    rerender(
      <ul>
        <ItemComponent {...(baseItem as unknown as TreeMenuItem)} isOpen />
      </ul>
    );
    expect(screen.getByRole('treeitem').getAttribute('aria-expanded')).toBe('true');
  });

  it('omits aria-expanded on leaf items (no children)', () => {
    renderIn({ hasNodes: false });
    expect(
      screen.getByRole('treeitem').hasAttribute('aria-expanded')
    ).toBe(false);
  });

  it('emits aria-level as 1-based depth', () => {
    renderIn({ level: 2 });
    expect(screen.getByRole('treeitem').getAttribute('aria-level')).toBe('3');
  });

  it('emits aria-selected reflecting active', () => {
    const { rerender } = renderIn({ active: false });
    expect(screen.getByRole('treeitem').getAttribute('aria-selected')).toBe('false');
    rerender(
      <ul>
        <ItemComponent {...(baseItem as unknown as TreeMenuItem)} active />
      </ul>
    );
    expect(screen.getByRole('treeitem').getAttribute('aria-selected')).toBe('true');
  });

  it('emits aria-setsize and aria-posinset when provided', () => {
    renderIn({ posInSet: 3, setSize: 7 });
    const el = screen.getByRole('treeitem');
    expect(el.getAttribute('aria-posinset')).toBe('3');
    expect(el.getAttribute('aria-setsize')).toBe('7');
  });

  it('roving tabindex: focused=0, unfocused=-1', () => {
    const { rerender } = renderIn({ focused: false });
    expect(screen.getByRole('treeitem').getAttribute('tabindex')).toBe('-1');
    rerender(
      <ul>
        <ItemComponent {...(baseItem as unknown as TreeMenuItem)} focused />
      </ul>
    );
    expect(screen.getByRole('treeitem').getAttribute('tabindex')).toBe('0');
  });

  it('moves DOM focus to the <li> when `focused` flips true', () => {
    const { rerender } = renderIn({ focused: false });
    const treeitem = screen.getByRole('treeitem');
    // Focus starts on <body> (nothing focused).
    expect(document.activeElement).not.toBe(treeitem);
    rerender(
      <ul>
        <ItemComponent {...(baseItem as unknown as TreeMenuItem)} focused />
      </ul>
    );
    // After focused flips true, DOM focus must land on the treeitem —
    // screen readers rely on the focus event to announce the row.
    expect(document.activeElement).toBe(treeitem);
  });

  it('preserves legacy rstm-* class names', () => {
    renderIn({ level: 2, active: true, focused: true });
    const treeitem = screen.getByRole('treeitem');
    // Structural classes live on the <li>.
    expect(treeitem.className).toContain('rstm-tree-item');
    expect(treeitem.className).toContain('rstm-tree-item-level2');
    // Visual state classes live on the inner row so that background /
    // ring styling doesn't bleed over nested children.
    const row = treeitem.querySelector('.rstm-tree-item-row')!;
    expect(row.className).toContain('rstm-tree-item--active');
    expect(row.className).toContain('rstm-tree-item--focused');
  });

  it('fires onClick when the item row is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <ul>
        <ItemComponent {...(baseItem as unknown as TreeMenuItem)} onClick={onClick} />
      </ul>
    );
    // Click the label text (inside the row). Clicking the bare <li> no
    // longer fires — the handler is on the row <div>, and the <li> is
    // now just a layout container.
    await user.click(screen.getByText('Fruits'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('toggle icon calls toggleNode and stops propagation', async () => {
    const onClick = vi.fn();
    const toggleNode = vi.fn();
    const user = userEvent.setup();
    render(
      <ul>
        <ItemComponent
          {...(baseItem as unknown as TreeMenuItem)}
          onClick={onClick}
          toggleNode={toggleNode}
        />
      </ul>
    );
    const toggle = screen
      .getByRole('treeitem')
      .querySelector('.rstm-toggle-icon') as HTMLElement;
    await user.click(toggle);
    expect(toggleNode).toHaveBeenCalledTimes(1);
    // Click on toggle shouldn't bubble and trigger the item's onClick.
    expect(onClick).not.toHaveBeenCalled();
  });

  it('omits toggle icon when hasNodes is false', () => {
    renderIn({ hasNodes: false });
    const toggle = screen
      .getByRole('treeitem')
      .querySelector('.rstm-toggle-icon');
    expect(toggle).toBeNull();
  });
});
