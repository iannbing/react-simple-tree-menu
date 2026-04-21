// Frozen snapshot of the react-simple-tree-menu v1.1.18 public API.
// Synthesized from src/index.tsx + src/TreeMenu/**/*.tsx + src/KeyDown.tsx
// at commit 0dbfb4e (development branch, April 2026 rewrite baseline).
//
// This file is the contract that v2's `dist/index.d.ts` must match after
// build, modulo the removals listed in api-v2-removals.json.
//
// Do NOT edit to match a new implementation. Edit only to correct a
// transcription error vs. v1 source.

import { MouseEvent, ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types (from src/TreeMenu/walk.tsx)
// ---------------------------------------------------------------------------

export interface TreeNodeObject {
  [name: string]: TreeNode;
}

export interface LocaleFunctionProps {
  label: string;
  [name: string]: any;
}

export interface MatchSearchFunctionProps extends LocaleFunctionProps {
  searchTerm: string;
}

export interface TreeNode extends LocaleFunctionProps {
  index: number;
  nodes?: TreeNodeObject;
}

export interface TreeNodeInArray extends LocaleFunctionProps {
  key: string;
  nodes?: TreeNodeInArray[];
}

export type LocaleFunction = (props: LocaleFunctionProps) => string;
export type MatchSearchFunction = (props: MatchSearchFunctionProps) => boolean;

export interface Item {
  hasNodes: boolean;
  isOpen: boolean;
  level: number;
  key: string;
  label: string;
  [name: string]: any;
}

// ---------------------------------------------------------------------------
// Types (from src/TreeMenu/renderProps.tsx)
// ---------------------------------------------------------------------------

export interface TreeMenuItem extends Item {
  active?: boolean;
  focused?: boolean;
  onClick: (event: MouseEvent<HTMLLIElement>) => void;
  toggleNode?: () => void;
}

export type TreeMenuChildren = (props: {
  search?: (term: string) => void;
  searchTerm?: string;
  items: TreeMenuItem[];
  resetOpenNodes?: (openNodes?: string[], activeKey?: string, focusKey?: string) => void;
}) => JSX.Element;

// ---------------------------------------------------------------------------
// Types (from src/TreeMenu/index.tsx)
// ---------------------------------------------------------------------------

export type TreeMenuProps = {
  data: { [name: string]: TreeNode } | TreeNodeInArray[];
  activeKey?: string;
  focusKey?: string;
  initialActiveKey?: string;
  initialFocusKey?: string;
  initialOpenNodes?: string[];
  openNodes?: string[];
  resetOpenNodesOnDataUpdate?: boolean;
  hasSearch?: boolean;
  cacheSearch?: boolean;
  onClickItem?: (props: Item) => void;
  debounceTime?: number;
  children?: TreeMenuChildren;
  locale?: LocaleFunction;
  matchSearch?: MatchSearchFunction;
  disableKeyboard?: boolean;
};

// ---------------------------------------------------------------------------
// Value exports
// ---------------------------------------------------------------------------

/** Default export: the TreeMenu component. */
declare const TreeMenu: any;
export default TreeMenu;

/** Default per-item renderer (used by defaultChildren). */
export declare const ItemComponent: any;

/** Default render-props function used when `children` is omitted. */
export declare const defaultChildren: TreeMenuChildren;

/** Keyboard navigation wrapper — public composition primitive. */
export declare const KeyDown: any;
