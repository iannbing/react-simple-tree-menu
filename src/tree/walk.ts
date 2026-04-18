// Pure tree-flattening function. SPEC §5 + perf contract §5.7–§5.8.
// No React, no runtime deps, no module-level caching (caller memoizes
// with useMemo).

import type {
  TreeNode,
  TreeNodeObject,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
  Item,
} from '../legacy/TreeMenu/walk';

type Data = TreeNodeObject | TreeNodeInArray[] | null | undefined;

export interface WalkProps {
  data: Data;
  openNodes: string[];
  searchTerm: string;
  locale?: LocaleFunction;
  matchSearch?: MatchSearchFunction;
}

const KEY_DELIMITER = '/';
const DEFAULT_LABEL = 'unknown';

const defaultLocale: LocaleFunction = ({ label }) => label;

// Default matcher: case-insensitive substring on the (locale-transformed)
// label. Receives the already-locale-transformed label; searchTerm is
// compared in lowercase once per walk (cached outside the hot loop).
const makeDefaultMatcher = (searchTerm: string): MatchSearchFunction => {
  const lowerTerm = searchTerm.trim().toLowerCase();
  return ({ label }) => label.trim().toLowerCase().includes(lowerTerm);
};

const isNonEmptyArray = (v: unknown): v is unknown[] =>
  Array.isArray(v) && v.length > 0;

const isNonEmptyObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0;

const hasData = (v: Data): v is TreeNodeObject | TreeNodeInArray[] =>
  isNonEmptyArray(v) || isNonEmptyObject(v);

/**
 * Flatten a nested tree into an ordered Item[] respecting current openNodes
 * and searchTerm. Visible items only — closed branches are skipped entirely
 * unless a search is active.
 */
export function walk(props: WalkProps): Item[] {
  const { data, openNodes, searchTerm, locale, matchSearch } = props;
  if (!hasData(data)) return [];

  const effectiveLocale = locale ?? defaultLocale;
  const effectiveMatch =
    matchSearch ??
    (searchTerm ? makeDefaultMatcher(searchTerm) : (() => true));
  const hasSearch = searchTerm.length > 0;
  const out: Item[] = [];

  // Recurse. parentKey is the accumulated slash-joined path; passing it in
  // avoids re-joining at each level (SPEC §5 perf acceptance).
  const visit = (
    node: TreeNode | TreeNodeInArray,
    nodeKey: string,
    parentKey: string,
    level: number
  ): void => {
    const { nodes, label: rawLabel = DEFAULT_LABEL, ...custom } = node;
    const key = parentKey
      ? parentKey + KEY_DELIMITER + nodeKey
      : nodeKey;

    const label = effectiveLocale({ label: rawLabel, ...custom });
    const childrenPresent = isNonEmptyArray(nodes) || isNonEmptyObject(nodes);
    const isOpen = childrenPresent && (openNodes.includes(key) || hasSearch);

    const visible =
      !hasSearch ||
      effectiveMatch({ label, searchTerm, ...(custom as Record<string, unknown>) });

    // Insert self first; children are appended in-place below so the output
    // array stays in depth-first order without ever concatenating.
    const selfIndex = out.length;
    const visibleSlot = visible ? selfIndex : -1;
    if (visible) {
      out.push({
        ...(custom as Record<string, unknown>),
        hasNodes: childrenPresent,
        isOpen,
        level,
        key,
        label,
      } as Item);
    }

    if (!isOpen) return; // short-circuit: closed-and-not-searching

    const childLevel = level + 1;
    if (Array.isArray(nodes)) {
      for (let i = 0; i < nodes.length; i++) {
        visit(nodes[i]!, (nodes[i] as TreeNodeInArray).key, key, childLevel);
      }
    } else if (nodes) {
      const entries = Object.entries(nodes as TreeNodeObject);
      entries.sort((a, b) => a[1].index - b[1].index);
      for (let i = 0; i < entries.length; i++) {
        visit(entries[i]![1], entries[i]![0], key, childLevel);
      }
    }

    // If we were invisible but a descendant matched, the caller can't know
    // that from this shape. Legacy auto-opens ancestors during search, and
    // we replicate: when `hasSearch` and any descendant was emitted after
    // `selfIndex`, retroactively insert self at `selfIndex`.
    if (!visible && hasSearch && out.length > selfIndex) {
      out.splice(selfIndex, 0, {
        ...(custom as Record<string, unknown>),
        hasNodes: childrenPresent,
        isOpen,
        level,
        key,
        label,
      } as Item);
    }

    // Silence "visibleSlot unused" when the path above doesn't read it.
    void visibleSlot;
  };

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      visit(data[i]!, data[i]!.key, '', 0);
    }
  } else {
    const entries = Object.entries(data);
    entries.sort((a, b) => a[1].index - b[1].index);
    for (let i = 0; i < entries.length; i++) {
      visit(entries[i]![1], entries[i]![0], '', 0);
    }
  }

  return out;
}
