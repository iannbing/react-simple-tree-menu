// Render-cost benchmarks for the full <TreeMenu> component tree. Covers
// what `walk.bench.ts` does not: the React commit cost for the items
// that walk emits. Uses `renderToString` as a sync, deterministic driver
// — it exercises the same Component render path the browser uses, minus
// effects (which aren't where our render cost lives).
//
// Run with `npm run test:bench`.
//
// Reading the results (PLAN.md M6.3 acceptance):
//
// - **Collapsed trees** are constant-time in input size thanks to walk()'s
//   closed-branch short-circuit. 1k / 10k / 50k all render in <0.1ms
//   because only the roots mount.
//
// - **Fully-expanded 10k** takes ~300ms via renderToString. That's an
//   unusual worst case: renderToString does not reconcile (every node is
//   freshly serialized) and nobody shows 10k open items at once in a real
//   app — virtualization is the right answer for that scale (see
//   docs/guides/virtualization). In a live browser, React 18's committer
//   is meaningfully faster per-item than the SSR string-builder, and an
//   "expand/collapse" toggle only commits the items that actually
//   change, not the entire tree.

import { bench, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import TreeMenu from '../index';
import type { TreeNodeInArray } from '../types';

function makeTree(size: number, fan: number): TreeNodeInArray[] {
  let id = 0;
  const nextId = () => `n${id++}`;
  const makeNode = (depthRemaining: number): TreeNodeInArray => {
    const node: TreeNodeInArray = { key: nextId(), label: `Label ${id}` };
    if (depthRemaining > 0 && id < size) {
      node.nodes = [];
      for (let i = 0; i < fan && id < size; i++) {
        node.nodes.push(makeNode(depthRemaining - 1));
      }
    }
    return node;
  };
  const roots: TreeNodeInArray[] = [];
  while (id < size) roots.push(makeNode(10));
  return roots;
}

// Collect every branch key (slash-joined path) so we can pass openNodes
// to force a fully-expanded render.
function allBranchKeys(data: TreeNodeInArray[]): string[] {
  const keys: string[] = [];
  const visit = (n: TreeNodeInArray, parent: string) => {
    const k = parent ? parent + '/' + n.key : n.key;
    if (n.nodes?.length) {
      keys.push(k);
      n.nodes.forEach((c) => visit(c, k));
    }
  };
  data.forEach((n) => visit(n, ''));
  return keys;
}

const tree1k = makeTree(1_000, 4);
const tree10k = makeTree(10_000, 4);
const tree50k = makeTree(50_000, 4);

const open10k = allBranchKeys(tree10k);

describe('TreeMenu render — collapsed (top-level items only)', () => {
  // All three benches emit the same number of DOM items (just the roots,
  // since every subtree is closed). They should be ~constant-time in the
  // input size thanks to walk()'s short-circuit.
  bench('1k tree, collapsed', () => {
    renderToString(<TreeMenu data={tree1k} />);
  });
  bench('10k tree, collapsed', () => {
    renderToString(<TreeMenu data={tree10k} />);
  });
  bench('50k tree, collapsed', () => {
    renderToString(<TreeMenu data={tree50k} />);
  });
});

describe('TreeMenu render — expanded', () => {
  bench('10k tree, fully expanded (worst realistic case)', () => {
    renderToString(<TreeMenu data={tree10k} openNodes={open10k} />);
  });
});

// Search-cost characterization lives in walk.bench.ts — the React render
// pass after walk is the same as the fully-expanded case above, and
// walk.bench covers the search-active flattening path directly.
