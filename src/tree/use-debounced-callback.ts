// Small hook replacing the tiny-debounce runtime dep.
// SPEC §6 (search debounce).

import { useEffect, useMemo, useRef } from 'react';

export interface DebouncedFn<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): DebouncedFn<Args> {
  // Always fire the latest callback even if it changes between invocations.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel any pending call on unmount so setState-after-unmount is impossible.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Stable across rerenders (only recreated when `delay` changes).
  return useMemo<DebouncedFn<Args>>(() => {
    const debounced = ((...args: Args) => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        callbackRef.current(...args);
      }, delay);
    }) as DebouncedFn<Args>;
    debounced.cancel = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    return debounced;
  }, [delay]);
}
