// Public entry point — v2 implementation.

export { TreeMenu as default } from './TreeMenu';
export { ItemComponent } from './ItemComponent';
export { defaultChildren } from './defaultChildren';
export { KeyDown } from './KeyDown';

// Types
export type { TreeMenuProps, TreeMenuHandle } from './TreeMenu';
export type {
  TreeMenuItem,
  TreeMenuChildren,
  TreeNode,
  TreeNodeObject,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
  Item,
} from './types';
