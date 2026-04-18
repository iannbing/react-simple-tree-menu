// Perf benchmarks for walk(). Enforces SPEC §5.7–§5.8 — notably the
// closed-branch short-circuit at 100k nodes. Run with `npm run test:bench`.
//
// These aren't strict CI gates yet (vitest bench doesn't fail on slow
// runs by default), but the numbers are checked in on PR and reviewed.
// A hard budget is introduced at M6.3.

import { bench, describe } from 'vitest';
import type { TreeNodeInArray } from '../legacy/TreeMenu/walk';
import { walk } from './walk';

// Build a balanced tree with `size` total nodes, branching factor `fan`.
// Each node has a unique label so the default matcher has realistic work.
function makeTree(size: number, fan: number): TreeNodeInArray[] {
  let id = 0;
  const nextId = () => `n${id++}`;
  const makeNode = (depthRemaining: number): TreeNodeInArray => {
    const node: TreeNodeInArray = {
      key: nextId(),
      label: `Label ${id}`,
    };
    if (depthRemaining > 0 && id < size) {
      node.nodes = [];
      for (let i = 0; i < fan && id < size; i++) {
        node.nodes.push(makeNode(depthRemaining - 1));
      }
    }
    return node;
  };
  const roots: TreeNodeInArray[] = [];
  while (id < size) {
    // Depth chosen so size/fan^depth ~ 1; fan=4 depth=10 → ~1M cap.
    roots.push(makeNode(10));
  }
  return roots;
}

const tiny = makeTree(1_000, 4);
const medium = makeTree(10_000, 4);
const huge = makeTree(100_000, 4);

const allOpen = (data: TreeNodeInArray[]): string[] => {
  const keys: string[] = [];
  const visit = (node: TreeNodeInArray, parent: string) => {
    const k = parent ? parent + '/' + node.key : node.key;
    keys.push(k);
    node.nodes?.forEach((n) => visit(n, k));
  };
  data.forEach((n) => visit(n, ''));
  return keys;
};

describe('walk — 1k nodes', () => {
  const openAll = allOpen(tiny);
  bench('all collapsed, no search', () => {
    walk({ data: tiny, openNodes: [], searchTerm: '' });
  });
  bench('all expanded, no search', () => {
    walk({ data: tiny, openNodes: openAll, searchTerm: '' });
  });
  bench('search active (no hits)', () => {
    walk({ data: tiny, openNodes: [], searchTerm: 'zzznomatch' });
  });
});

describe('walk — 10k nodes', () => {
  const openAll = allOpen(medium);
  bench('all collapsed, no search', () => {
    walk({ data: medium, openNodes: [], searchTerm: '' });
  });
  bench('all expanded, no search', () => {
    walk({ data: medium, openNodes: openAll, searchTerm: '' });
  });
  bench('search active (no hits)', () => {
    walk({ data: medium, openNodes: [], searchTerm: 'zzznomatch' });
  });
});

describe('walk — 100k nodes (short-circuit contract)', () => {
  bench('all collapsed, no search — must be microseconds', () => {
    walk({ data: huge, openNodes: [], searchTerm: '' });
  });
});
