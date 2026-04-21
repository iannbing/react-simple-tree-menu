// Pure tree-flattening function. SPEC §5 + perf contract §5.7–§5.8.
// No React, no runtime deps, no module-level caching (caller memoizes
// with useMemo).

import type {
  Item,
  LocaleFunction,
  MatchSearchFunction,
  TreeNode,
  TreeNodeInArray,
  TreeNodeObject,
} from '../types';

type Data = TreeNodeObject | TreeNodeInArray[] | null | undefined;

export interface WalkProps {
  data: Data;
  openNodes: string[];
  searchTerm: string;
  // Explicit `| undefined` on optional props so callers can pass
  // destructured values through without tripping
  // exactOptionalPropertyTypes.
  locale?: LocaleFunction | undefined;
  matchSearch?: MatchSearchFunction | undefined;
  keySeparator?: string | undefined;
}

const DEFAULT_KEY_SEPARATOR = '/';
const DEFAULT_LABEL = 'unknown';

const defaultLocale: LocaleFunction = ({ label }) => label;

// Default matcher: case-insensitive substring on the (locale-transformed)
// label. Receives the already-locale-transformed label; searchTerm is
// compared in lowercase once per walk (cached outside the hot loop).
const makeDefaultMatcher = (searchTerm: string): MatchSearchFunction => {
  const lowerTerm = searchTerm.trim().toLowerCase();
  return ({ label }) => label.trim().toLowerCase().includes(lowerTerm);
};

const isNonEmptyArray = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0;

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
  const { data, openNodes, searchTerm, locale, matchSearch, keySeparator } = props;
  if (!hasData(data)) return [];

  const effectiveLocale = locale ?? defaultLocale;
  const effectiveMatch =
    matchSearch ?? (searchTerm ? makeDefaultMatcher(searchTerm) : () => true);
  const hasSearch = searchTerm.length > 0;
  const sep = keySeparator || DEFAULT_KEY_SEPARATOR;
  const out: Item[] = [];

  // Recurse. parentKey is the accumulated slash-joined path; passing it in
  // avoids re-joining at each level (SPEC §5 perf acceptance).
  // posInSet / setSize are ARIA sibling coordinates (1-indexed) — cheap to
  // compute here and saves downstream readers from re-grouping by parent.
  const visit = (
    node: TreeNode | TreeNodeInArray,
    nodeKey: string,
    parentKey: string,
    level: number,
    posInSet: number,
    setSize: number
  ): void => {
    // Strip fields that are walk-internal / structural from `custom` so
    // they don't leak as data properties onto the emitted Item:
    //   - `nodes`    — the nested children collection (recursed into separately)
    //   - `label`    — transformed by `locale()` below; rebound from rawLabel
    //   - `index`    — object-format sort key, meaningful only pre-walk
    //   - `key`      — array-format's own node key; we emit the computed path
    // Anything else a consumer attached (url, icon, whatever) flows through.
    //
    // Cast to a permissive record: the public types forbid `index` on
    // array-form nodes and `key` on object-form, but at runtime we may see
    // either so we destructure both and discard them uniformly.
    const {
      nodes,
      label: rawLabel = DEFAULT_LABEL,
      index: _discardIndex,
      key: _discardKey,
      ...custom
    } = node;
    const key = parentKey ? parentKey + sep + nodeKey : nodeKey;

    const label = effectiveLocale({ label: rawLabel, ...custom });
    const childrenPresent = isNonEmptyArray(nodes) || isNonEmptyObject(nodes);
    const isOpen = childrenPresent && (openNodes.includes(key) || hasSearch);

    const visible = !hasSearch || effectiveMatch({ label, searchTerm, ...custom });

    // Insert self first; children are appended in-place below so the output
    // array stays in depth-first order without ever concatenating.
    const selfIndex = out.length;
    if (visible) {
      out.push({
        ...custom,
        hasNodes: childrenPresent,
        isOpen,
        level,
        key,
        label,
        posInSet,
        setSize,
      } as Item);
    }

    if (!isOpen) return; // short-circuit: closed-and-not-searching

    const childLevel = level + 1;
    if (Array.isArray(nodes)) {
      const n = nodes.length;
      for (let i = 0; i < n; i++) {
        visit(nodes[i]!, (nodes[i] as TreeNodeInArray).key, key, childLevel, i + 1, n);
      }
    } else if (nodes) {
      const entries = Object.entries(nodes as TreeNodeObject);
      entries.sort((a, b) => a[1].index - b[1].index);
      const n = entries.length;
      for (let i = 0; i < n; i++) {
        visit(entries[i]![1], entries[i]![0], key, childLevel, i + 1, n);
      }
    }

    // If we were invisible but a descendant matched, the caller can't know
    // that from this shape. Legacy auto-opens ancestors during search, and
    // we replicate: when `hasSearch` and any descendant was emitted after
    // `selfIndex`, retroactively insert self at `selfIndex`.
    if (!visible && hasSearch && out.length > selfIndex) {
      out.splice(selfIndex, 0, {
        ...custom,
        hasNodes: childrenPresent,
        isOpen,
        level,
        key,
        label,
        posInSet,
        setSize,
      } satisfies Item);
    }
  };

  if (Array.isArray(data)) {
    const n = data.length;
    for (let i = 0; i < n; i++) {
      visit(data[i]!, data[i]!.key, '', 0, i + 1, n);
    }
  } else {
    const entries = Object.entries(data);
    entries.sort((a, b) => a[1].index - b[1].index);
    const n = entries.length;
    for (let i = 0; i < n; i++) {
      visit(entries[i]![1], entries[i]![0], '', 0, i + 1, n);
    }
  }

  return out;
}
