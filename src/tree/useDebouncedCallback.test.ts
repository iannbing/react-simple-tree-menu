// Unit tests for the (future) useDebouncedCallback hook at
// src/tree/useDebouncedCallback.ts. Stubbed with `it.todo` until M3.2.
//
// Small hook (~20 lines) replacing the `tiny-debounce` runtime dep.
// SPEC §6 (search debounce behavior).

import { describe, it } from 'vitest';

describe('useDebouncedCallback — SPEC §6', () => {
  describe('debounce behavior', () => {
    it.todo('calls through after `delay` ms when invoked once');
    it.todo('collapses rapid successive calls into a single delayed invocation');
    it.todo('uses the latest arguments when collapsing calls');
    it.todo('delay=0 still defers to the next task (not synchronous)');
  });

  describe('cleanup', () => {
    it.todo('pending call does not fire after the component unmounts');
    it.todo('cancel() on the returned function clears any pending call');
  });

  describe('identity + latest-callback semantics', () => {
    it.todo('returned function reference is stable across rerenders');
    it.todo('fires the latest callback if the wrapped fn changes between calls');
  });
});
