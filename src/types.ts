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

export type TreeMenuChildren = (props: {
  search?: (term: string) => void;
  searchTerm?: string;
  items: TreeMenuItem[];
  resetOpenNodes?: (
    openNodes?: string[],
    activeKey?: string,
    focusKey?: string
  ) => void;
}) => ReactElement;
