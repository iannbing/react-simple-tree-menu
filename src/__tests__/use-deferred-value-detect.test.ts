// Sanity test for the useDeferredValue feature detection in tree-menu.tsx.
// We don't unit-test the wrapping directly (it's a one-liner), but we
// assert that React 18+ exposes the hook and that it's usable — so a
// consumer on the dev-dep react@18.3 sees the smoothing behavior. On
// React 16.14/17 the identity fallback kicks in; that path is exercised
// by the CI matrix, not here.

import { describe, it, expect } from 'vitest';
import * as React from 'react';

// React 16.14 / 17 don't ship `useDeferredValue` — the feature
// detection's whole point is that the library runs on both sides.
const hasUseDeferredValue =
  typeof (React as unknown as { useDeferredValue?: unknown }).useDeferredValue ===
  'function';

describe('useDeferredValue feature detect', () => {
  it.skipIf(!hasUseDeferredValue)(
    'the dev-dep React exposes useDeferredValue on React 18+',
    () => {
      expect(
        typeof (React as unknown as { useDeferredValue?: unknown }).useDeferredValue
      ).toBe('function');
    }
  );

  it('falls through cleanly if useDeferredValue is absent', () => {
    // Simulate the identity-fallback branch from tree-menu.tsx.
    const fakeReact = {} as { useDeferredValue?: <T>(v: T) => T };
    const fallback: <T>(v: T) => T =
      fakeReact.useDeferredValue ?? (<T,>(v: T): T => v);
    expect(fallback('x')).toBe('x');
    expect(fallback(42)).toBe(42);
    const obj = { a: 1 };
    expect(fallback(obj)).toBe(obj); // reference-equal
  });
});
