// Unit tests for the (future) useTreeMenuState hook at
// src/tree/useTreeMenuState.ts. Stubbed with `it.todo` until M3.3.
//
// Hook owns the four-slot state (openNodes, searchTerm, activeKey,
// focusKey) via useReducer with controlled/uncontrolled duality at the
// boundary. SPEC §4.

import { describe, it } from 'vitest';

describe('useTreeMenuState — SPEC §4', () => {
  describe('initialization', () => {
    it.todo('seeds openNodes from initialOpenNodes (default [])');
    it.todo('seeds activeKey from initialActiveKey (default "")');
    it.todo('seeds focusKey from initialFocusKey (default "")');
    it.todo('seeds searchTerm as ""');
  });

  describe('actions (uncontrolled)', () => {
    it.todo('TOGGLE adds a key not in openNodes');
    it.todo('TOGGLE removes a key already in openNodes');
    it.todo('SEARCH updates searchTerm');
    it.todo('ACTIVATE sets both activeKey and focusKey');
    it.todo('FOCUS sets focusKey only');
    it.todo('RESET restores to initial state with no arguments');
    it.todo('RESET accepts openNodes / activeKey / focusKey overrides');
    it.todo('RESET clears searchTerm regardless of arguments');
  });

  describe('controlled prop overrides', () => {
    it.todo('controlled openNodes bypasses internal state');
    it.todo('controlled activeKey bypasses internal state');
    it.todo('controlled focusKey bypasses internal state');
    it.todo('TOGGLE is a no-op when openNodes is controlled');
    it.todo('controlled → uncontrolled transition preserves last state');
  });

  describe('dispatch identity', () => {
    it.todo('returned dispatch is referentially stable across rerenders');
  });
});
