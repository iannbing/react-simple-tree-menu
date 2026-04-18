// Public types for react-simple-tree-menu. Hoisted out of src/legacy/
// as part of M5.2 so they survive the legacy deletion at M5.4.
// Shapes are frozen — see test-fixtures/api-v1.d.ts and the
// check-api-contract script.

import type { MouseEvent, ReactElement } from 'react';

// ---------------------------------------------------------------------------
// Node data
// ---------------------------------------------------------------------------

export interface LocaleFunctionProps {
  label: string;
  [name: string]: unknown;
}

export interface MatchSearchFunctionProps extends LocaleFunctionProps {
  searchTerm: string;
}

export interface TreeNode extends LocaleFunctionProps {
  index: number;
  nodes?: TreeNodeObject;
}

export interface TreeNodeObject {
  [name: string]: TreeNode;
}

export interface TreeNodeInArray extends LocaleFunctionProps {
  key: string;
  nodes?: TreeNodeInArray[];
}

// ---------------------------------------------------------------------------
// Item (what walk() emits, and what render-props receive)
// ---------------------------------------------------------------------------

export interface Item {
  hasNodes: boolean;
  isOpen: boolean;
  level: number;
  key: string;
  label: string;
  posInSet?: number;
  setSize?: number;
  [name: string]: unknown;
}

export interface TreeMenuItem extends Item {
  active?: boolean;
  focused?: boolean;
  onClick: (event: MouseEvent<HTMLLIElement>) => void;
  toggleNode?: () => void;
}

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

export type LocaleFunction = (props: LocaleFunctionProps) => string;
export type MatchSearchFunction = (props: MatchSearchFunctionProps) => boolean;

/**
 * Human-readable copy for the default UI. Used for i18n / brand voice
 * without dropping into custom render-props.
 */
export interface TreeMenuLabels {
  /** Placeholder inside the search input. Default: `"Search"`. */
  searchPlaceholder?: string | undefined;
  /** `aria-label` on the search input. Default: `"Search"`. */
  searchAriaLabel?: string | undefined;
}

/**
 * Optional per-slot class names that are **appended** to the library's
 * default `rstm-*` anchors. Intended for consumers who want Tailwind (or
 * any other utility-class) styling without importing the default CSS.
 *
 * The `rstm-*` classes remain on the DOM regardless; they're inert
 * strings when the default CSS isn't imported, so there's zero style
 * cost but backward-compat overrides on those selectors keep working.
 */
// Internal convenience — fields annotated with `| undefined` so they
// round-trip through destructure/spread under exactOptionalPropertyTypes.
// Public-facing, this is equivalent to `{ [slot]?: string }`.
export interface TreeMenuClassNames {
  /** Outer `<ul role="tree">` container */
  group?: string | undefined;
  /** Nested `<ul role="group">` — one per expanded branch */
  subgroup?: string | undefined;
  /** `<li>` item in any state */
  item?: string | undefined;
  /** Appended to `item` when the item is active */
  active?: string | undefined;
  /** Appended to `item` when the item is keyboard-focused */
  focused?: string | undefined;
  /** `<input type="search">` */
  search?: string | undefined;
  /** The `<div>` wrapper around the toggle icon (on items with children) */
  toggleIcon?: string | undefined;
  /** The inner `<div role="img">` that holds the open/closed symbol */
  toggleIconSymbol?: string | undefined;
}

export type TreeMenuChildren = (props: {
  search?: (term: string) => void;
  searchTerm?: string;
  items: TreeMenuItem[];
  resetOpenNodes?: (
    openNodes?: string[],
    activeKey?: string,
    focusKey?: string
  ) => void;
  /** Passed through from TreeMenu's `classNames` prop. */
  classNames?: TreeMenuClassNames | undefined;
  /** Passed through from TreeMenu's `labels` prop. */
  labels?: TreeMenuLabels | undefined;
}) => ReactElement;
