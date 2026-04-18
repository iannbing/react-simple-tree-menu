// Reconstruct a nested tree shape from the flat Item[] that walk() emits.
// Pure, allocation-lean, and independent of React — consumers can call it
// inside a render-prop to build `<ul>/<li>/<ul>` DOM, or use it outside of
// rendering for analytics / tree-walks against the visible list.
//
// The relationship between an item and its parent lives in `item.key`:
// keys are slash-joined paths like `"fruit/berry/strawberry"`. The
// substring before the last `/` names the parent; items with no `/` are
// roots. That convention is the library's only public coupling between
// the flat and nested representations.

export interface UnflattenResult<T> {
  /** Top-level items (keys without a `/`). */
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
  items: readonly T[]
): UnflattenResult<T> {
  const roots: T[] = [];
  const childrenByParent = new Map<string, T[]>();
  for (const item of items) {
    const slash = item.key.lastIndexOf('/');
    if (slash === -1) {
      roots.push(item);
    } else {
      const parent = item.key.slice(0, slash);
      const siblings = childrenByParent.get(parent);
      if (siblings) siblings.push(item);
      else childrenByParent.set(parent, [item]);
    }
  }
  return { roots, childrenByParent };
}
