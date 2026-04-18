// Default per-item renderer for v2. Emits the WAI-ARIA tree pattern
// (role=treeitem + aria-expanded/level/selected/setsize/posinset), roving
// tabindex, and the legacy `rstm-*` class names. SPEC §12.
//
// Memoized — renders only when the Item (and its wrapper props) change.

import { memo, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import type { TreeMenuClassNames, TreeMenuItem } from './types';

// Left-padding math. CSS handles vertical padding, cursor, hover, etc.;
// only horizontal indentation varies per-level so we inject it inline.
// Tighter than v1's 0.75 + 2/1.75 — looks less cramped at deep levels.
const DEFAULT_PADDING = 0.75;
const LEVEL_SPACE = 1;
const LEAF_OFFSET = 1.5; // extra indent for leaf nodes (no toggle icon)

// Subset of TreeMenuClassNames this component cares about.
export type ItemClassNames = Pick<
  TreeMenuClassNames,
  'item' | 'active' | 'focused' | 'toggleIcon' | 'toggleIconSymbol'
>;

// ItemComponentProps = TreeMenuItem + renderer-only props. posInSet and
// setSize already live on Item via walk(), so no need to re-declare.
export interface ItemComponentProps extends TreeMenuItem {
  openedIcon?: ReactNode;
  closedIcon?: ReactNode;
  style?: CSSProperties;
  /** Appended to the `rstm-*` anchor classes. */
  classNames?: ItemClassNames | undefined;
  /**
   * Nested content rendered inside the `<li>` after the label — typically
   * the `<ul role="group">` holding child items. Empty / absent for leaf
   * items and for closed branches.
   */
  children?: ReactNode;
}

function cx(...tokens: Array<string | false | null | undefined>): string {
  let out = '';
  for (const t of tokens) {
    if (!t) continue;
    out = out ? out + ' ' + t : t;
  }
  return out;
}

function ItemComponentImpl({
  hasNodes = false,
  isOpen = false,
  level = 0,
  onClick,
  toggleNode,
  active,
  focused,
  openedIcon = '\u25BE', // ▾  down-pointing small triangle
  closedIcon = '\u25B8', // ▸  right-pointing small triangle
  label = 'unknown',
  style,
  posInSet,
  setSize,
  classNames,
  children,
}: ItemComponentProps) {
  // Structural classes on the <li> — consumers still get selector hooks
  // via rstm-tree-item + rstm-tree-item-level{N}.
  const liClassName = cx(
    'rstm-tree-item',
    `rstm-tree-item-level${level}`
  );

  // Visual classes on the inner row <div>. State modifiers (--active,
  // --focused) and consumer-supplied classNames live here because they
  // style the *row*, which must not extend over nested children.
  const rowClassName = cx(
    'rstm-tree-item-row',
    active && 'rstm-tree-item--active',
    focused && 'rstm-tree-item--focused',
    classNames?.item,
    active && classNames?.active,
    focused && classNames?.focused
  );

  const handleToggleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (toggleNode) {
      toggleNode();
      e.stopPropagation();
    }
  };

  // The click handler lives on the row <div>, not the <li>. Events from
  // a child item bubble up through child <li> → subgroup <ul> → parent
  // <li>, but the parent's row <div> is a sibling of that chain (not an
  // ancestor), so nothing extra fires. No stopPropagation needed.
  const handleRowClick = (e: MouseEvent<HTMLDivElement>) => {
    onClick(e as unknown as MouseEvent<HTMLLIElement>);
  };

  return (
    <li
      role="treeitem"
      tabIndex={focused ? 0 : -1}
      aria-level={level + 1}
      aria-selected={!!active}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      // aria-expanded is only meaningful on nodes with children.
      {...(hasNodes ? { 'aria-expanded': isOpen } : {})}
      className={liClassName}
    >
      {/* Visual row. Padding, hover, active, focused all live here so
          styling doesn't bleed over the nested <ul> below. Keyboard
          navigation is handled by the KeyDown wrapper one level up,
          hence no per-row onKeyDown. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={rowClassName}
        style={{
          paddingLeft: `${
            DEFAULT_PADDING + (hasNodes ? 0 : LEAF_OFFSET) + level * LEVEL_SPACE
          }rem`,
          ...style,
        }}
        onClick={handleRowClick}
      >
        {hasNodes && (
          // Ornamental toggle — Arrow-Left/Right on the treeitem already
          // drives expand/collapse via KeyDown. Mouse-only convenience.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            className={cx('rstm-toggle-icon', classNames?.toggleIcon)}
            onClick={handleToggleClick}
          >
            <div
              className={cx(
                'rstm-toggle-icon-symbol',
                classNames?.toggleIconSymbol
              )}
              role="img"
              aria-label="Toggle"
            >
              {isOpen ? openedIcon : closedIcon}
            </div>
          </div>
        )}
        {label}
      </div>
      {children}
    </li>
  );
}

export const ItemComponent = memo(ItemComponentImpl);
