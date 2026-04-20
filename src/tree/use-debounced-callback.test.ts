// Unit tests for useDebouncedCallback. SPEC §6 (search debounce).
// Replaces the tiny-debounce runtime dep.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { act, render } from '@testing-library/react';
import { useDebouncedCallback } from './use-debounced-callback';

// Local `renderHook` shim — see `use-tree-menu-state.test.ts` for the
// rationale (RTL v12 shipped with the React 16/17 CI jobs doesn't
// export renderHook; render() is stable across every RTL version in
// our matrix).
function renderHook<P extends Record<string, unknown>, R>(
  callback: (props: P) => R,
  options?: { initialProps?: P }
): {
  result: { current: R };
  rerender: (newProps?: P) => void;
  unmount: () => void;
} {
  const result = { current: undefined as unknown as R };
  const TestHost: React.FC<P> = (props) => {
    result.current = callback(props);
    return null;
  };
  const initialProps = options?.initialProps ?? ({} as P);
  const utils = render(React.createElement(TestHost, initialProps));
  return {
    result,
    rerender: (newProps?: P) => {
      utils.rerender(React.createElement(TestHost, newProps ?? ({} as P)));
    },
    unmount: () => utils.unmount(),
  };
}

describe('useDebouncedCallback — SPEC §6', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce behavior', () => {
    it('calls through after `delay` ms when invoked once', () => {
      const fn = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(fn, 100));
      act(() => result.current('x'));
      expect(fn).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(99);
      });
      expect(fn).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(fn).toHaveBeenCalledWith('x');
    });

    it('collapses rapid successive calls into a single delayed invocation', () => {
      const fn = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(fn, 100));
      act(() => {
        result.current('a');
        vi.advanceTimersByTime(50);
        result.current('b');
        vi.advanceTimersByTime(50);
        result.current('c');
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    });

    it('uses the latest arguments when collapsing calls', () => {
      const fn = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(fn, 50));
      act(() => {
        result.current('first', 1);
        result.current('last', 2);
      });
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(fn).toHaveBeenCalledWith('last', 2);
    });

    it('delay=0 defers to the next task (not synchronous)', () => {
      const fn = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(fn, 0));
      act(() => result.current('x'));
      expect(fn).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(fn).toHaveBeenCalledWith('x');
    });
  });

  describe('cleanup', () => {
    it('pending call does not fire after the component unmounts', () => {
      const fn = vi.fn();
      const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 100));
      act(() => result.current('x'));
      unmount();
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(fn).not.toHaveBeenCalled();
    });

    it('cancel() on the returned function clears any pending call', () => {
      const fn = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(fn, 100));
      act(() => result.current('x'));
      act(() => result.current.cancel());
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('identity + latest-callback semantics', () => {
    it('returned function reference is stable across rerenders', () => {
      const fn = vi.fn();
      const { result, rerender } = renderHook(
        ({ cb, delay }) => useDebouncedCallback(cb, delay),
        { initialProps: { cb: fn, delay: 100 } }
      );
      const first = result.current;
      rerender({ cb: vi.fn(), delay: 100 });
      expect(result.current).toBe(first);
    });

    it('fires the latest callback if the wrapped fn changes between calls', () => {
      const a = vi.fn();
      const b = vi.fn();
      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 100),
        { initialProps: { cb: a } }
      );
      act(() => result.current('x'));
      rerender({ cb: b });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledWith('x');
    });
  });
});
