// Unit tests for the (future) pure tree-flattening function at
// src/tree/walk.ts. Stubbed with `it.todo` until M3.1 implements the
// module. Each todo names a contract the implementation must satisfy,
// drawn from SPEC §5 (walk) and §5.7–5.8 (perf).
//
// When M3.1 lands, each `it.todo` is converted to a real `it(...)` with
// assertions. CI will catch any test-count regression once the file
// starts running assertions.

import { describe, it } from 'vitest';

describe('walk() — SPEC §5', () => {
  describe('data formats', () => {
    it.todo('flattens array-format data in array order');
    it.todo('flattens object-format data with siblings sorted by numeric `index`');
    it.todo('passes custom node props through to Item');
  });

  describe('key path convention', () => {
    it.todo('top-level Item keys equal the node key (no prefix)');
    it.todo('nested Item keys are slash-joined ancestor paths');
  });

  describe('shape of each emitted Item', () => {
    it.todo('Item.hasNodes is true iff node has non-empty `nodes`');
    it.todo('Item.isOpen true iff node is in openNodes OR searchTerm is active');
    it.todo('Item.level 0-indexed starting from roots');
    it.todo('Item.label is the locale-transformed label (default: identity)');
  });

  describe('visibility rules', () => {
    it.todo('no searchTerm → only open branches and their visible descendants');
    it.todo('searchTerm present → matches by matchSearch (default: case-insensitive substring)');
    it.todo('matching items auto-open their ancestors during search');
    it.todo('custom matchSearch replaces the default');
    it.todo('custom locale transforms label before matchSearch sees it');
  });

  describe('edge cases', () => {
    it.todo('empty object data returns []');
    it.todo('empty array data returns []');
    it.todo('undefined / null data returns [] without throwing');
    it.todo('deeply nested trees (10+ levels) flatten correctly');
  });

  describe('perf acceptance (SPEC §5.7–§5.8)', () => {
    // Correctness-level perf contracts. Timing bounds live in walk.bench.ts.
    it.todo('closed branches with no search are not recursed into');
    it.todo('default matcher lowercases each label once per walk (via spy)');
    it.todo('custom matchSearch receives raw (non-lowercased) label');
    it.todo('key path is built incrementally, not by joining arrays at each level');
  });
});
