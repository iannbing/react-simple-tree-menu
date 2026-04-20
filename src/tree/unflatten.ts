// Reconstruct a nested tree shape from the flat Item[] that walk() emits.
// Pure, allocation-lean, and independent of React — consumers can call it
// inside a render-prop to build `<ul>/<li>/<ul>` DOM, or use it outside of
// rendering for analytics / tree-walks against the visible list.
//
// The relationship between an item and its parent lives in `item.key`:
// keys are separator-joined paths like `"fruit/berry/strawberry"` (or
// whatever `keySeparator` was passed to TreeMenu). The substring before
// the last separator names the parent; items without the separator are
// roots.

export interface UnflattenResult<T> {
  /** Top-level items (keys without the separator). */
  roots: T[];
  /** Map from a parent's key to its ordered child items. */
  childrenByParent: Map<string, T[]>;
}

/**
 * Group a flat `Item[]` by parent key, preserving the original depth-first
 * ordering of siblings. Useful inside custom render-props when you want to
 * emit a nested `<ul>/<li>/<ul>` tree instead of one flat list.
 *
 * Generic over `T extends { key: string }` — works with raw `Item`,
 * `TreeMenuItem`, or any consumer shape that carries a `key`.
 *
 * @param items  Flat item list emitted by walk() / exposed via the
 *               render-prop `items` payload.
 * @param keySeparator  Separator that joins keys into paths. Must match
 *               the separator passed to `<TreeMenu>` (default: `"/"`).
 *
 * @example
 *   const { roots, childrenByParent } = unflatten(items);
 *   const renderNode = (item: TreeMenuItem): ReactNode => (
 *     <li key={item.key}>
 *       {item.label}
 *       {childrenByParent.get(item.key)?.map(renderNode)}
 *     </li>
 *   );
 *   return <ul>{roots.map(renderNode)}</ul>;
 */
export function unflatten<T extends { key: string }>(
  items: readonly T[],
  keySeparator = '/'
): UnflattenResult<T> {
  const roots: T[] = [];
  const childrenByParent = new Map<string, T[]>();
  for (const item of items) {
    const sepAt = item.key.lastIndexOf(keySeparator);
    if (sepAt === -1) {
      roots.push(item);
    } else {
      const parent = item.key.slice(0, sepAt);
      const siblings = childrenByParent.get(parent);
      if (siblings) siblings.push(item);
      else childrenByParent.set(parent, [item]);
    }
  }
  return { roots, childrenByParent };
}
