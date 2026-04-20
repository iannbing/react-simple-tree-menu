import { describe, it, expect } from 'vitest';
import { collectBranchKeys } from './collect-branch-keys';
import type { TreeNodeInArray, TreeNodeObject } from '../types';

describe('collectBranchKeys', () => {
  it('returns [] for empty / undefined data', () => {
    expect(collectBranchKeys(undefined)).toEqual([]);
    expect(collectBranchKeys(null)).toEqual([]);
    expect(collectBranchKeys([])).toEqual([]);
    expect(collectBranchKeys({})).toEqual([]);
  });

  it('skips leaf nodes — only branches are collected', () => {
    const data: TreeNodeInArray[] = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B', nodes: [{ key: 'b1', label: 'B1' }] },
      { key: 'c', label: 'C' },
    ];
    expect(collectBranchKeys(data)).toEqual(['b']);
  });

  it('recurses into children and joins paths with the separator', () => {
    const data: TreeNodeInArray[] = [
      {
        key: 'fruit',
        label: 'Fruit',
        nodes: [
          { key: 'apple', label: 'Apple' },
          {
            key: 'berry',
            label: 'Berry',
            nodes: [
              { key: 'strawberry', label: 'Strawberry' },
              { key: 'blueberry', label: 'Blueberry' },
            ],
          },
        ],
      },
    ];
    expect(collectBranchKeys(data)).toEqual(['fruit', 'fruit/berry']);
  });

  it('honors a custom keySeparator', () => {
    const data: TreeNodeInArray[] = [
      {
        key: 'a',
        label: 'A',
        nodes: [
          {
            key: 'b',
            label: 'B',
            nodes: [{ key: 'c', label: 'C' }],
          },
        ],
      },
    ];
    expect(collectBranchKeys(data, '.')).toEqual(['a', 'a.b']);
  });

  it('handles object-format data', () => {
    const data: TreeNodeObject = {
      a: { label: 'A', index: 0 },
      b: {
        label: 'B',
        index: 1,
        nodes: {
          b1: { label: 'B1', index: 0 },
        },
      },
    };
    // Branch keys include `b` (has children) but not `a` (leaf).
    expect(collectBranchKeys(data).sort()).toEqual(['b']);
  });

  it('is pure — does not mutate input', () => {
    const data: TreeNodeInArray[] = [
      { key: 'a', label: 'A', nodes: [{ key: 'a1', label: 'A1' }] },
    ];
    const snapshot = JSON.stringify(data);
    collectBranchKeys(data);
    expect(JSON.stringify(data)).toBe(snapshot);
  });

  it('O(N) — collects 100k-branch tree without stalling', () => {
    // Wide + linear mix: 1k roots each with 100 children = 101k nodes,
    // 1k of which are branches. Should complete in milliseconds.
    const data: TreeNodeInArray[] = Array.from({ length: 1000 }, (_, i) => ({
      key: `r${i}`,
      label: `R${i}`,
      nodes: Array.from({ length: 100 }, (_, j) => ({
        key: `c${j}`,
        label: `C${j}`,
      })),
    }));
    const t0 = performance.now();
    const keys = collectBranchKeys(data);
    const elapsed = performance.now() - t0;
    expect(keys).toHaveLength(1000);
    expect(elapsed).toBeLessThan(100);
  });
});
