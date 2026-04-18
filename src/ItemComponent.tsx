// Default per-item renderer for v2. Emits the WAI-ARIA tree pattern
// (role=treeitem + aria-expanded/level/selected/setsize/posinset), roving
// tabindex, and the legacy `rstm-*` class names. SPEC §12.
//
// Memoized — renders only when the Item (and its wrapper props) change.

import { memo, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import type { TreeMenuItem } from './types';

const DEFAULT_PADDING = 0.75;
const ICON_SIZE = 2;
const LEVEL_SPACE = 1.75;

export interface ItemComponentProps extends TreeMenuItem {
  openedIcon?: ReactNode;
  closedIcon?: ReactNode;
  style?: CSSProperties;
  posInSet?: number;
  setSize?: number;
}

function cx(...tokens: Array<string | false | null | undefined>): string {
  let out = '';
  for (const t of tokens) {
    if (!t) continue;
    out = out ? out + ' ' + t : t;
  }
  return out;
}

function ItemComponentImpl(props: ItemComponentProps) {
  const {
    hasNodes = false,
    isOpen = false,
    level = 0,
    onClick,
    toggleNode,
    active,
    focused,
    openedIcon = '-',
    closedIcon = '+',
    label = 'unknown',
    style,
    posInSet,
    setSize,
    ...rest
  } = props;

  const className = cx(
    'rstm-tree-item',
    `rstm-tree-item-level${level}`,
    active && 'rstm-tree-item--active',
    focused && 'rstm-tree-item--focused'
  );

  const handleToggleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (toggleNode) {
      toggleNode();
      e.stopPropagation();
    }
  };

  // ARIA: aria-expanded only applies to items that have children.
  const ariaExpanded = hasNodes ? { 'aria-expanded': isOpen } : undefined;

  return (
    // Keyboard navigation for the tree is handled by the KeyDown wrapper
    // one level up; adding per-item keyboard handlers here would duplicate
    // and interfere with the roving-tabindex model.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
      {...(rest as object)}
      role="treeitem"
      tabIndex={focused ? 0 : -1}
      aria-level={level + 1}
      aria-selected={!!active}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      {...ariaExpanded}
      className={className}
      style={{
        paddingLeft: `${
          DEFAULT_PADDING + ICON_SIZE * (hasNodes ? 0 : 1) + level * LEVEL_SPACE
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
        <div className="rstm-toggle-icon" onClick={handleToggleClick}>
          <div className="rstm-toggle-icon-symbol" role="img" aria-label="Toggle">
            {isOpen ? openedIcon : closedIcon}
          </div>
        </div>
      )}
      {label}
    </li>
  );
}

export const ItemComponent = memo(ItemComponentImpl);
