import TreeMenu from './legacy/TreeMenu';

// export components
export default TreeMenu;
export { defaultChildren, ItemComponent } from './legacy/TreeMenu/renderProps';
export { default as KeyDown } from './legacy/KeyDown';

// export type definitions
export type { TreeMenuProps } from './legacy/TreeMenu';
export type { TreeMenuItem, TreeMenuChildren } from './legacy/TreeMenu/renderProps';
export type {
  TreeNodeObject,
  TreeNode,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
  Item,
} from './legacy/TreeMenu/walk';
