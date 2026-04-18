// Public entry point — v2 implementation.

export { TreeMenu as default } from './tree-menu';
export { ItemComponent } from './item-component';
export { defaultChildren } from './default-children';
export { KeyDown } from './key-down';

// Types
export type { TreeMenuProps, TreeMenuHandle } from './tree-menu';
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
