import { describe, it, expect } from 'vitest';
import { unflatten } from './unflatten';

// Minimal item shape — the function is generic over anything with `key`.
type I = { key: string; label: string };
const item = (key: string, label = key): I => ({ key, label });

describe('unflatten', () => {
  it('returns empty result for an empty input', () => {
    const { roots, childrenByParent } = unflatten<I>([]);
    expect(roots).toEqual([]);
    expect(childrenByParent.size).toBe(0);
  });

  it('treats keys without a slash as roots', () => {
    const items: I[] = [item('a'), item('b'), item('c')];
    const { roots, childrenByParent } = unflatten(items);
    expect(roots.map((r) => r.key)).toEqual(['a', 'b', 'c']);
    expect(childrenByParent.size).toBe(0);
  });

  it('groups children by immediate parent (slash-joined paths)', () => {
    const items: I[] = [
      item('fruit'),
      item('fruit/apple'),
      item('fruit/banana'),
      item('vegetable'),
      item('vegetable/carrot'),
    ];
    const { roots, childrenByParent } = unflatten(items);
    expect(roots.map((r) => r.key)).toEqual(['fruit', 'vegetable']);
    expect(childrenByParent.get('fruit')?.map((c) => c.key)).toEqual([
      'fruit/apple',
      'fruit/banana',
    ]);
    expect(childrenByParent.get('vegetable')?.map((c) => c.key)).toEqual([
      'vegetable/carrot',
    ]);
  });

  it('handles arbitrary nesting depth', () => {
    const items: I[] = [
      item('a'),
      item('a/b'),
      item('a/b/c'),
      item('a/b/c/d'),
    ];
    const { roots, childrenByParent } = unflatten(items);
    expect(roots.map((r) => r.key)).toEqual(['a']);
    expect(childrenByParent.get('a')?.map((c) => c.key)).toEqual(['a/b']);
    expect(childrenByParent.get('a/b')?.map((c) => c.key)).toEqual(['a/b/c']);
    expect(childrenByParent.get('a/b/c')?.map((c) => c.key)).toEqual([
      'a/b/c/d',
    ]);
  });

  it('preserves sibling order from the input', () => {
    const items: I[] = [
      item('z'),
      item('z/2'),
      item('z/1'),
      item('z/3'),
    ];
    const { childrenByParent } = unflatten(items);
    // Order under z/ must be the input order (2, 1, 3) — unflatten is a
    // grouping, not a sort.
    expect(childrenByParent.get('z')?.map((c) => c.key)).toEqual([
      'z/2',
      'z/1',
      'z/3',
    ]);
  });

  it('accepts readonly input (type-level)', () => {
    const frozen: readonly I[] = Object.freeze([item('x'), item('x/y')]);
    // Should compile and produce the expected structure without mutating
    // the input (smoke test — we rely on TS for the readonly contract).
    const { roots } = unflatten(frozen);
    expect(roots).toHaveLength(1);
  });

  it('preserves the original item reference', () => {
    const a = item('a');
    const { roots } = unflatten<I>([a]);
    expect(roots[0]).toBe(a);
  });
});
