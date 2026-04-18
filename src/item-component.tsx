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
}: ItemComponentProps) {
  const className = cx(
    'rstm-tree-item',
    `rstm-tree-item-level${level}`,
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

  return (
    // Keyboard navigation for the tree is handled by the KeyDown wrapper
    // one level up; adding per-item keyboard handlers here would duplicate
    // and interfere with the roving-tabindex model.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
      role="treeitem"
      tabIndex={focused ? 0 : -1}
      aria-level={level + 1}
      aria-selected={!!active}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      // aria-expanded is only meaningful on nodes with children.
      {...(hasNodes ? { 'aria-expanded': isOpen } : {})}
      className={className}
      style={{
        paddingLeft: `${
          DEFAULT_PADDING + (hasNodes ? 0 : LEAF_OFFSET) + level * LEVEL_SPACE
        }rem`,
        ...style,
      }}
      onClick={onClick}
    >
      {hasNodes && (
        // Ornamental toggle — Arrow-Left/Right on the containing treeitem
        // already drive expand/collapse via KeyDown. The div is a mouse-only
        // convenience; screen reader users navigate via aria-expanded.
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
    </li>
  );
}

export const ItemComponent = memo(ItemComponentImpl);
