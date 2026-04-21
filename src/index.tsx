// Public entry point — v2 implementation.

export { TreeMenu as default } from './tree-menu';
export { ItemComponent } from './item-component';
export { defaultChildren } from './default-children';
export { KeyDown } from './key-down';
export { unflatten } from './tree/unflatten';
export { collectBranchKeys } from './tree/collect-branch-keys';

// Types
export type { TreeMenuProps, TreeMenuHandle } from './tree-menu';
export type { UnflattenResult } from './tree/unflatten';
export type {
  TreeMenuItem,
  TreeMenuChildren,
  TreeMenuClassNames,
  TreeMenuLabels,
  TreeNode,
  TreeNodeObject,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
  Item,
} from './types';
