// Unit tests for the pure tree-flattening function. SPEC §5 + §5.7–§5.8.
// Activated in M3.1 alongside the implementation at src/tree/walk.ts.

import { describe, it, expect, vi } from 'vitest';
import { walk } from './walk';
import type {
  TreeNodeInArray,
  TreeNodeObject,
  LocaleFunction,
  MatchSearchFunction,
} from '../types';

const arr: TreeNodeInArray[] = [
  {
    key: 'fruits',
    label: 'Fruits',
    url: '/fruits',
    nodes: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
    ],
  },
  { key: 'vegetables', label: 'Vegetables' },
];

const obj: TreeNodeObject = {
  z: { label: 'Zebra', index: 1 },
  a: { label: 'Ant', index: 0, nodes: { a1: { label: 'A1', index: 0 } } },
};

describe('walk() — SPEC §5', () => {
  describe('data formats', () => {
    it('flattens array-format data in array order', () => {
      const items = walk({ data: arr, openNodes: [], searchTerm: '' });
      expect(items.map((i) => i.label)).toEqual(['Fruits', 'Vegetables']);
    });

    it('flattens object-format data with siblings sorted by numeric index', () => {
      const items = walk({ data: obj, openNodes: [], searchTerm: '' });
      expect(items.map((i) => i.label)).toEqual(['Ant', 'Zebra']);
    });

    it('passes custom node props through to Item', () => {
      const items = walk({ data: arr, openNodes: [], searchTerm: '' });
      const fruits = items.find((i) => i.key === 'fruits');
      expect(fruits).toMatchObject({ url: '/fruits' });
    });
  });

  describe('key path convention', () => {
    it('top-level Item keys equal the node key (no prefix)', () => {
      const items = walk({ data: arr, openNodes: [], searchTerm: '' });
      expect(items.map((i) => i.key)).toContain('fruits');
      expect(items.map((i) => i.key)).toContain('vegetables');
    });

    it('nested Item keys are slash-joined ancestor paths', () => {
      const items = walk({ data: arr, openNodes: ['fruits'], searchTerm: '' });
      expect(items.map((i) => i.key)).toContain('fruits/apple');
      expect(items.map((i) => i.key)).toContain('fruits/banana');
    });
  });

  describe('shape of each emitted Item', () => {
    it('Item.hasNodes is true iff node has non-empty `nodes`', () => {
      const items = walk({ data: arr, openNodes: [], searchTerm: '' });
      const fruits = items.find((i) => i.key === 'fruits')!;
      const vegetables = items.find((i) => i.key === 'vegetables')!;
      expect(fruits.hasNodes).toBe(true);
      expect(vegetables.hasNodes).toBe(false);
    });

    it('Item.isOpen true iff node is in openNodes OR searchTerm is active', () => {
      const closed = walk({ data: arr, openNodes: [], searchTerm: '' });
      expect(closed.find((i) => i.key === 'fruits')!.isOpen).toBe(false);

      const opened = walk({ data: arr, openNodes: ['fruits'], searchTerm: '' });
      expect(opened.find((i) => i.key === 'fruits')!.isOpen).toBe(true);

      const searching = walk({ data: arr, openNodes: [], searchTerm: 'apple' });
      expect(searching.find((i) => i.key === 'fruits')!.isOpen).toBe(true);
    });

    it('Item.level is 0-indexed starting from roots', () => {
      const items = walk({ data: arr, openNodes: ['fruits'], searchTerm: '' });
      expect(items.find((i) => i.key === 'fruits')!.level).toBe(0);
      expect(items.find((i) => i.key === 'fruits/apple')!.level).toBe(1);
    });

    it('Item.label is the locale-transformed label (default: identity)', () => {
      const items = walk({ data: arr, openNodes: [], searchTerm: '' });
      expect(items.find((i) => i.key === 'fruits')!.label).toBe('Fruits');
    });

    it('Item.posInSet / Item.setSize are 1-indexed sibling coordinates', () => {
      const items = walk({ data: arr, openNodes: ['fruits'], searchTerm: '' });
      const fruits = items.find((i) => i.key === 'fruits')!;
      const vegetables = items.find((i) => i.key === 'vegetables')!;
      const apple = items.find((i) => i.key === 'fruits/apple')!;
      const banana = items.find((i) => i.key === 'fruits/banana')!;
      expect(fruits).toMatchObject({ posInSet: 1, setSize: 2 });
      expect(vegetables).toMatchObject({ posInSet: 2, setSize: 2 });
      expect(apple).toMatchObject({ posInSet: 1, setSize: 2 });
      expect(banana).toMatchObject({ posInSet: 2, setSize: 2 });
    });
  });

  describe('visibility rules', () => {
    it('no searchTerm → only roots and descendants of open branches', () => {
      const items = walk({ data: arr, openNodes: [], searchTerm: '' });
      expect(items.map((i) => i.key)).toEqual(['fruits', 'vegetables']);
    });

    it('searchTerm present → filters by default case-insensitive substring', () => {
      const items = walk({ data: arr, openNodes: [], searchTerm: 'AppLE' });
      expect(items.map((i) => i.key)).toEqual(['fruits', 'fruits/apple']);
    });

    it('matching items auto-open their ancestors during search', () => {
      // Apple is inside closed Fruits. Search for Apple → Fruits becomes
      // visible and Apple is emitted beneath it.
      const items = walk({ data: arr, openNodes: [], searchTerm: 'apple' });
      expect(items.map((i) => i.key)).toContain('fruits');
      expect(items.map((i) => i.key)).toContain('fruits/apple');
    });

    it('custom matchSearch replaces the default', () => {
      // Exact-match matcher.
      const matchSearch: MatchSearchFunction = ({ label, searchTerm }) =>
        label === searchTerm;
      const items = walk({
        data: arr,
        openNodes: [],
        searchTerm: 'Fruits',
        matchSearch,
      });
      expect(items.map((i) => i.key)).toContain('fruits');
      expect(items.map((i) => i.key)).not.toContain('fruits/apple');
    });

    it('custom locale transforms label before matchSearch sees it', () => {
      const locale: LocaleFunction = ({ label }) => label.toUpperCase();
      const seen: string[] = [];
      const matchSearch: MatchSearchFunction = ({ label, searchTerm }) => {
        seen.push(label);
        return label.includes(searchTerm);
      };
      walk({
        data: [{ key: 'x', label: 'hello' }],
        openNodes: [],
        searchTerm: 'HELLO',
        locale,
        matchSearch,
      });
      expect(seen).toContain('HELLO');
    });
  });

  describe('internal fields do not leak onto Items', () => {
    it('omits the object-format `index` sort key from emitted Items', () => {
      const items = walk({
        data: { foo: { label: 'Foo', index: 3 } },
        openNodes: [],
        searchTerm: '',
      });
      expect(items[0]).not.toHaveProperty('index');
    });

    it('omits raw node `key`/`nodes` from emitted Items (recomputed/recursed)', () => {
      const items = walk({
        data: [{ key: 'a', label: 'Alpha', nodes: [{ key: 'b', label: 'Beta' }] }],
        openNodes: ['a'],
        searchTerm: '',
      });
      // Each Item has the computed key, but no stray `nodes` array.
      for (const it of items) {
        expect(it).not.toHaveProperty('nodes');
      }
    });
  });

  describe('edge cases', () => {
    it('empty object data returns []', () => {
      expect(walk({ data: {}, openNodes: [], searchTerm: '' })).toEqual([]);
    });

    it('empty array data returns []', () => {
      expect(walk({ data: [], openNodes: [], searchTerm: '' })).toEqual([]);
    });

    it('undefined data returns [] without throwing', () => {
      expect(() =>
        walk({ data: undefined, openNodes: [], searchTerm: '' })
      ).not.toThrow();
      expect(walk({ data: undefined, openNodes: [], searchTerm: '' })).toEqual(
        []
      );
    });

    it('deeply nested trees flatten correctly', () => {
      // Build a 10-level linear chain: a → a/b → a/b/c → ...
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      let node: TreeNodeInArray = { key: letters[9]!, label: letters[9]! };
      for (let i = 8; i >= 0; i--) {
        node = { key: letters[i]!, label: letters[i]!, nodes: [node] };
      }
      const openNodes = letters.slice(0, 9).map((_, i) => letters.slice(0, i + 1).join('/'));
      const items = walk({ data: [node], openNodes, searchTerm: '' });
      expect(items).toHaveLength(10);
      expect(items[9]!.level).toBe(9);
      expect(items[9]!.key).toBe(letters.join('/'));
    });
  });

  describe('perf acceptance (SPEC §5.7–§5.8)', () => {
    it('closed branches with no search are not recursed into', () => {
      // Large wide tree; walking with empty openNodes must yield only the
      // top-level N items. If we accidentally recurse, the output balloons.
      const N = 1000;
      const wide: TreeNodeInArray[] = Array.from({ length: N }, (_, i) => ({
        key: `n${i}`,
        label: `N${i}`,
        nodes: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ],
      }));
      const items = walk({ data: wide, openNodes: [], searchTerm: '' });
      expect(items).toHaveLength(N);
    });

    it('custom matchSearch receives raw (non-lowercased) label', () => {
      const seen: string[] = [];
      const matchSearch: MatchSearchFunction = ({ label, searchTerm }) => {
        seen.push(label);
        return label.includes(searchTerm);
      };
      walk({
        data: [{ key: 'x', label: 'MixedCase' }],
        openNodes: [],
        searchTerm: 'Mixed',
        matchSearch,
      });
      // Raw mixed case preserved — walker must not pre-lowercase when a
      // custom matcher is supplied.
      expect(seen).toContain('MixedCase');
    });

    it('default matcher is case-insensitive without invoking locale more than once per node', () => {
      const locale = vi.fn<LocaleFunction>(({ label }) => label);
      walk({
        data: arr,
        openNodes: ['fruits'],
        searchTerm: 'apple',
        locale,
      });
      // Fruits + Apple + Banana + Vegetables = 4 nodes that are visited.
      // locale should be called once per *visited* node. We don't demand
      // a specific count, but it shouldn't be quadratic.
      expect(locale.mock.calls.length).toBeLessThanOrEqual(4);
    });
  });
});
