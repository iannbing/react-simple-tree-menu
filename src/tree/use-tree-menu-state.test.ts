// Unit tests for useTreeMenuState — the reducer hook that owns
// openNodes / searchTerm / activeKey / focusKey with controlled/
// uncontrolled duality at the boundary. SPEC §4.

import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { act, render } from '@testing-library/react';
import { useTreeMenuState } from './use-tree-menu-state';

// Local `renderHook` shim. `@testing-library/react`'s own `renderHook`
// was added in RTL v13 — the CI matrix installs v12 for React 16.14 /
// 17 peers, which only exports `render`. This shim exercises the hook
// through a trivial component and surfaces its return value via a
// ref-like object, so the test stays identical across every RTL
// version in the matrix.
function renderHook<P, R>(
  callback: (props: P) => R,
  options?: { initialProps?: P }
): {
  result: { current: R };
  rerender: (newProps?: P) => void;
  unmount: () => void;
} {
  const result = { current: undefined as unknown as R };
  function TestHost(props: P): null {
    result.current = callback(props);
    return null;
  }
  const initialProps = (options?.initialProps ?? ({} as P)) as P & React.JSX.IntrinsicAttributes;
  const utils = render(React.createElement(TestHost, initialProps));
  return {
    result,
    rerender: (newProps?: P) => {
      const next = (newProps ?? ({} as P)) as P & React.JSX.IntrinsicAttributes;
      utils.rerender(React.createElement(TestHost, next));
    },
    unmount: () => utils.unmount(),
  };
}

describe('useTreeMenuState — SPEC §4', () => {
  describe('initialization', () => {
    it('seeds openNodes from initialOpenNodes (default [])', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      expect(result.current.state.openNodes).toEqual([]);

      const { result: withInitial } = renderHook(() =>
        useTreeMenuState({ initialOpenNodes: ['a', 'b'] })
      );
      expect(withInitial.current.state.openNodes).toEqual(['a', 'b']);
    });

    it('seeds activeKey from initialActiveKey (default "")', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      expect(result.current.state.activeKey).toBe('');
      const { result: r2 } = renderHook(() =>
        useTreeMenuState({ initialActiveKey: 'x' })
      );
      expect(r2.current.state.activeKey).toBe('x');
    });

    it('seeds focusKey from initialFocusKey (default "")', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      expect(result.current.state.focusKey).toBe('');
      const { result: r2 } = renderHook(() =>
        useTreeMenuState({ initialFocusKey: 'y' })
      );
      expect(r2.current.state.focusKey).toBe('y');
    });

    it('seeds searchTerm as ""', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      expect(result.current.state.searchTerm).toBe('');
    });
  });

  describe('actions (uncontrolled)', () => {
    it('TOGGLE adds a key not in openNodes', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      act(() => result.current.dispatch({ type: 'TOGGLE', key: 'a' }));
      expect(result.current.state.openNodes).toEqual(['a']);
    });

    it('TOGGLE removes a key already in openNodes', () => {
      const { result } = renderHook(() =>
        useTreeMenuState({ initialOpenNodes: ['a', 'b'] })
      );
      act(() => result.current.dispatch({ type: 'TOGGLE', key: 'a' }));
      expect(result.current.state.openNodes).toEqual(['b']);
    });

    it('SEARCH updates searchTerm', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      act(() => result.current.dispatch({ type: 'SEARCH', term: 'hello' }));
      expect(result.current.state.searchTerm).toBe('hello');
    });

    it('ACTIVATE sets both activeKey and focusKey', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      act(() => result.current.dispatch({ type: 'ACTIVATE', key: 'a/b' }));
      expect(result.current.state.activeKey).toBe('a/b');
      expect(result.current.state.focusKey).toBe('a/b');
    });

    it('FOCUS sets focusKey only', () => {
      const { result } = renderHook(() =>
        useTreeMenuState({ initialActiveKey: 'a' })
      );
      act(() => result.current.dispatch({ type: 'FOCUS', key: 'b' }));
      expect(result.current.state.focusKey).toBe('b');
      expect(result.current.state.activeKey).toBe('a'); // unchanged
    });

    it('RESET restores to initial state with no overrides', () => {
      const { result } = renderHook(() =>
        useTreeMenuState({ initialOpenNodes: ['root'] })
      );
      act(() => result.current.dispatch({ type: 'TOGGLE', key: 'x' }));
      act(() => result.current.dispatch({ type: 'SEARCH', term: 'q' }));
      act(() => result.current.dispatch({ type: 'ACTIVATE', key: 'a' }));
      act(() => result.current.dispatch({ type: 'RESET' }));
      expect(result.current.state.openNodes).toEqual(['root']);
      expect(result.current.state.searchTerm).toBe('');
      expect(result.current.state.activeKey).toBe('');
      expect(result.current.state.focusKey).toBe('');
    });

    it('RESET accepts openNodes / activeKey / focusKey overrides', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      act(() =>
        result.current.dispatch({
          type: 'RESET',
          openNodes: ['x'],
          activeKey: 'y',
          focusKey: 'z',
        })
      );
      expect(result.current.state.openNodes).toEqual(['x']);
      expect(result.current.state.activeKey).toBe('y');
      expect(result.current.state.focusKey).toBe('z');
    });

    it('RESET clears searchTerm regardless of arguments', () => {
      const { result } = renderHook(() => useTreeMenuState({}));
      act(() => result.current.dispatch({ type: 'SEARCH', term: 'q' }));
      act(() =>
        result.current.dispatch({ type: 'RESET', openNodes: ['a'] })
      );
      expect(result.current.state.searchTerm).toBe('');
    });
  });

  describe('controlled prop overrides', () => {
    it('controlled openNodes bypasses internal state', () => {
      const { result } = renderHook(() =>
        useTreeMenuState({ openNodes: ['controlled'] })
      );
      expect(result.current.state.openNodes).toEqual(['controlled']);
    });

    it('controlled activeKey bypasses internal state', () => {
      const { result } = renderHook(() =>
        useTreeMenuState({ activeKey: 'controlled-active' })
      );
      expect(result.current.state.activeKey).toBe('controlled-active');
    });

    it('controlled focusKey bypasses internal state', () => {
      const { result } = renderHook(() =>
        useTreeMenuState({ focusKey: 'controlled-focus' })
      );
      expect(result.current.state.focusKey).toBe('controlled-focus');
    });

    it('TOGGLE is a no-op when openNodes is controlled', () => {
      const { result } = renderHook(() =>
        useTreeMenuState({ openNodes: ['x'] })
      );
      act(() => result.current.dispatch({ type: 'TOGGLE', key: 'y' }));
      // Still just the controlled value.
      expect(result.current.state.openNodes).toEqual(['x']);
    });

    it('controlled prop value flows through when it changes', () => {
      const { result, rerender } = renderHook(
        ({ openNodes }: { openNodes: string[] }) =>
          useTreeMenuState({ openNodes }),
        { initialProps: { openNodes: ['a'] } }
      );
      expect(result.current.state.openNodes).toEqual(['a']);
      rerender({ openNodes: ['a', 'b'] });
      expect(result.current.state.openNodes).toEqual(['a', 'b']);
    });
  });

  describe('dispatch identity', () => {
    it('returned dispatch is referentially stable across rerenders', () => {
      const { result, rerender } = renderHook(() => useTreeMenuState({}));
      const first = result.current.dispatch;
      rerender();
      expect(result.current.dispatch).toBe(first);
    });
  });
});
