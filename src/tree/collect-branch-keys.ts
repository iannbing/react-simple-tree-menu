// Collect every branch key in a data tree, keyed by the same path
// convention walk() uses. This is the library's ONLY full-tree traversal
// — exposed for expandAll() and for consumers using controlled
// `openNodes` who want to implement their own expand-all.
//
// Perf note: collection itself is O(N) and microseconds even on 100k
// nodes. The real cost comes downstream when the tree renders: fully
// expanded, every branch's children mount, which pushes the DOM-render
// phase into the seconds. Pair with the virtualization recipe in the
// docs site for large trees.

import type { TreeNodeObject, TreeNodeInArray } from '../types';

type Data = TreeNodeObject | TreeNodeInArray[] | null | undefined;

const isNonEmptyArray = (v: unknown): v is unknown[] =>
  Array.isArray(v) && v.length > 0;

const isNonEmptyObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0;

/**
 * Collect the path keys of every node with children. Keys are joined
 * with `keySeparator` — pass the same value you pass to `<TreeMenu>`.
 *
 * @param data           Object- or array-form tree.
 * @param keySeparator   Path delimiter, default `"/"`.
 *
 * @example
 *   const ref = useRef<TreeMenuHandle>(null);
 *   ref.current?.expandAll(); // uses collectBranchKeys internally
 *
 *   // Or, for controlled openNodes:
 *   const [open, setOpen] = useState<string[]>([]);
 *   const onExpandAll = () => setOpen(collectBranchKeys(data));
 */
export function collectBranchKeys(
  data: Data,
  keySeparator = '/'
): string[] {
  if (!data) return [];
  const out: string[] = [];

  const visit = (
    node: { nodes?: TreeNodeObject | TreeNodeInArray[] },
    key: string
  ): void => {
    const { nodes } = node;
    const hasChildren = isNonEmptyArray(nodes) || isNonEmptyObject(nodes);
    if (!hasChildren) return;
    out.push(key);
    if (Array.isArray(nodes)) {
      for (const child of nodes as TreeNodeInArray[]) {
        visit(child, key + keySeparator + child.key);
      }
    } else if (nodes) {
      for (const [childKey, childNode] of Object.entries(
        nodes as TreeNodeObject
      )) {
        visit(childNode, key + keySeparator + childKey);
      }
    }
  };

  if (Array.isArray(data)) {
    for (const node of data as TreeNodeInArray[]) {
      visit(node, node.key);
    }
  } else {
    for (const [key, node] of Object.entries(data as TreeNodeObject)) {
      visit(node, key);
    }
  }
  return out;
}
