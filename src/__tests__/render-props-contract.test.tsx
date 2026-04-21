// Proves that the render-props contract is unchanged by the nested-DOM
// switch in defaultChildren. A consumer who supplies their own `children`
// function receives the same flat items[] array with the same item shape
// they had in v1, and can render flat, nested, or virtualized output
// freely — the library does nothing DOM-structural for them.
//
// jsx-a11y rules disabled for this file only — these tests intentionally
// render minimal consumer patterns (raw <li onClick>) to prove the
// contract, not to model production-ready a11y.
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import TreeMenu, { type TreeMenuItem, type TreeNodeInArray } from '../index';

const data: TreeNodeInArray[] = [
  {
    key: 'alpha',
    label: 'Alpha',
    nodes: [
      { key: 'a1', label: 'A1' },
      { key: 'a2', label: 'A2' },
    ],
  },
  { key: 'beta', label: 'Beta' },
];

describe('render-props contract', () => {
  it('items[] handed to custom children is flat, regardless of tree depth', () => {
    let captured: readonly TreeMenuItem[] = [];
    render(
      <TreeMenu data={data} initialOpenNodes={['alpha']}>
        {({ items }) => {
          captured = items;
          return <div data-testid="probe" />;
        }}
      </TreeMenu>
    );
    // Alpha (open), A1, A2, Beta — four visible items in depth-first order.
    expect(captured.map((i) => i.key)).toEqual(['alpha', 'alpha/a1', 'alpha/a2', 'beta']);
    // Each nested item's key carries its ancestor path — that's how a
    // consumer would reconstruct nesting client-side if they wanted to.
    expect(captured[1]!.key.startsWith('alpha/')).toBe(true);
    // level is available on every item.
    expect(captured[0]!.level).toBe(0);
    expect(captured[1]!.level).toBe(1);
  });

  it('custom renderer can build FLAT DOM (v1-style); clicks fire onClickItem', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    render(
      <TreeMenu
        data={data}
        initialOpenNodes={['alpha']}
        onClickItem={onClickItem}
      >
        {({ items }) => (
          <ul data-testid="flat-list">
            {items.map((i) => (
              <li key={i.key} onClick={i.onClick}>
                {i.label}
              </li>
            ))}
          </ul>
        )}
      </TreeMenu>
    );
    await user.click(screen.getByText('A1'));
    expect(onClickItem).toHaveBeenCalledTimes(1);
    expect(onClickItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'alpha/a1', label: 'A1' })
    );
  });

  it('custom renderer can build NESTED DOM; consumer-provided stopPropagation isolates child clicks', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    render(
      <TreeMenu
        data={data}
        initialOpenNodes={['alpha']}
        onClickItem={onClickItem}
      >
        {({ items }) => {
          // Mirror what defaultChildren does: un-flatten via key paths.
          const byParent = new Map<string, TreeMenuItem[]>();
          const roots: TreeMenuItem[] = [];
          for (const it of items) {
            const slash = it.key.lastIndexOf('/');
            if (slash === -1) {
              roots.push(it);
            } else {
              const p = it.key.slice(0, slash);
              const arr = byParent.get(p) ?? [];
              arr.push(it);
              byParent.set(p, arr);
            }
          }
          const renderNode = (item: TreeMenuItem): ReactElement => {
            const children = byParent.get(item.key);
            return (
              <li
                key={item.key}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick(e);
                }}
              >
                {item.label}
                {children && <ul>{children.map(renderNode)}</ul>}
              </li>
            );
          };
          return <ul>{roots.map(renderNode)}</ul>;
        }}
      </TreeMenu>
    );
    await user.click(screen.getByText('A1'));
    // Consumer supplied stopPropagation, so only A1 fires.
    expect(onClickItem).toHaveBeenCalledTimes(1);
    expect(onClickItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'alpha/a1' })
    );
  });

  it('custom renderer can slice items[] (virtualization pattern)', () => {
    // Simulates "only render items 0..1" the way react-window would with
    // an overscan window. The library hands back a plain array, so any
    // slice / map / filter is a no-op for the library.
    render(
      <TreeMenu data={data} initialOpenNodes={['alpha']}>
        {({ items }) => (
          <ul>
            {items.slice(0, 2).map((i) => (
              <li key={i.key}>{i.label}</li>
            ))}
          </ul>
        )}
      </TreeMenu>
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.queryByText('A2')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('search() passed to custom renderer still debounces + filters items', async () => {
    vi.useFakeTimers();
    render(
      <TreeMenu data={data} debounceTime={0}>
        {({ items, search }) => (
          <>
            <input
              data-testid="custom-search"
              onChange={(e) => search?.(e.target.value)}
            />
            <ul>
              {items.map((i) => (
                <li key={i.key}>{i.label}</li>
              ))}
            </ul>
          </>
        )}
      </TreeMenu>
    );
    // `fireEvent.change` in one shot — user.type()'s per-keystroke
    // simulation deadlocks under React 19 + fake timers (see the
    // matching note in characterization.test.tsx's `setSearch`).
    fireEvent.change(screen.getByTestId('custom-search'), {
      target: { value: 'a1' },
    });
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    // Alpha auto-opens (search), A1 matches, Beta doesn't.
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('resetOpenNodes(newOpenNodes) passed to custom renderer actually resets state', async () => {
    const user = userEvent.setup();
    render(
      <TreeMenu data={data} initialOpenNodes={['alpha']}>
        {({ items, resetOpenNodes }) => (
          <>
            {/* Explicitly pass [] — no-arg reset restores to
                initialOpenNodes, which would leave alpha open. SPEC §9. */}
            <button
              data-testid="reset"
              onClick={() => resetOpenNodes?.([])}
            />
            <ul>
              {items.map((i) => (
                <li key={i.key}>{i.label}</li>
              ))}
            </ul>
          </>
        )}
      </TreeMenu>
    );
    // Initially open.
    expect(screen.getByText('A1')).toBeInTheDocument();
    await user.click(screen.getByTestId('reset'));
    expect(screen.queryByText('A1')).not.toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
