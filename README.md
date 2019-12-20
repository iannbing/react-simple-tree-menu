# React Simple Tree Menu

[![npm version](https://badge.fury.io/js/react-simple-tree-menu.svg)](https://badge.fury.io/js/react-simple-tree-menu)
[![CircleCI](https://circleci.com/gh/iannbing/react-simple-tree-menu/tree/master.svg?style=shield)](https://circleci.com/gh/iannbing/react-simple-tree-menu/tree/master)
[![Storybook](https://cdn.jsdelivr.net/gh/storybooks/brand@master/badge/badge-storybook.svg)](https://iannbing.github.io/react-simple-tree-menu/)

Inspired by [Downshift](https://github.com/downshift-js/downshift), a simple, data-driven, light-weight React Tree Menu component that:

- does not depend on any UI framework
- fully customizable with `render props` and `control props`
- allows search
- supports keyboard browsing

Check [Storybook Demo](https://iannbing.github.io/react-simple-tree-menu/).

## Usage

Install with the following command in your React app:

```bash
npm i react-simple-tree-menu
// or
yarn add react-simple-tree-menu
```

To generate a `TreeMenu`, you need to provide data in the following structure.

```js
// as an array
const treeData = [
  {
    key: 'first-level-node-1',
    label: 'Node 1 at the first level',
    ..., // any other props you need, e.g. url
    nodes: [
      {
        key: 'second-level-node-1',
        label: 'Node 1 at the second level',
        nodes: [
          {
            key: 'third-level-node-1',
            label: 'Last node of the branch',
            nodes: [] // you can remove the nodes property or leave it as an empty array
          },
        ],
      },
    ],
  },
  {
    key: 'first-level-node-2',
    label: 'Node 2 at the first level',
  },
];
// or as an object
const treeData = {
  'first-level-node-1': {               // key
    label: 'Node 1 at the first level',
    index: 0, // decide the rendering order on the same level
    ...,      // any other props you need, e.g. url
    nodes: {
      'second-level-node-1': {
        label: 'Node 1 at the second level',
        index: 0,
        nodes: {
          'third-level-node-1': {
            label: 'Node 1 at the third level',
            index: 0,
            nodes: {} // you can remove the nodes property or leave it as an empty array
          },
        },
      },
    },
  },
  'first-level-node-2': {
    label: 'Node 2 at the first level',
    index: 1,
  },
};

```

And then import `TreeMenu` and use it. By default you only need to provide `data`. You can have more control over the behaviors of the components using the provided API.

```jsx
import TreeMenu from 'react-simple-tree-menu';
...
// import default minimal styling or your own styling
import '../node_modules/react-simple-tree-menu/dist/main.css';
// Use the default minimal UI
<TreeMenu data={treeData} />

// Use any third-party UI framework
<TreeMenu
  data={treeData}
  onClickItem={({ key, label, ...props }) => {
    this.navigate(props.url); // user defined prop
  }}
  initialActiveKey='first-level-node-1/second-level-node-1' // the path to the active node
  debounceTime={125}>
    {({ search, items }) => (
        <>
          <Input onChange={e => search(e.target.value)} placeholder="Type and search" />
          <ListGroup>
            {items.map(props => (
              // You might need to wrap the third-party component to consume the props
              // check the story as an example
              // https://github.com/iannbing/react-simple-tree-menu/blob/master/stories/index.stories.js
              <ListItem {...props} />
            ))}
          </ListGroup>
        </>
    )}
</TreeMenu>

```

If you want to extend the minial UI components, they are exported at your disposal.

``` jsx
// you can import and extend the default minial UI
import TreeMenu, { defaultChildren, ItemComponent } from 'react-simple-tree-menu';

// add custom styling to the list item
<TreeMenu data={treeData}>
    {({ search, items }) => (
        <ul>
            {items.map(({key, ...props}) => (
              <ItemComponent key={key} {...props} />
            ))}
        </ul>
    )}
</TreeMenu>

// add a button to do resetOpenNodes
<TreeMenu data={treeData}>
    {({ search, items, resetOpenNodes }) => (
      <div>
        <button onClick={resetOpenNodes} />
        {defaultChildren({search, items})}
      </div>
    )}
</TreeMenu>

```

### Keyboard browsing

When the tree menu is focused, you can use your keyboard to browse the tree.

- UP: move the focus onto the previous node
- DOWN: move the focus onto the next node
- LEFT: close the current node if it has children and it is open; otherwise move the focus to the parent node
- RIGHT: open the current node if it has children
- ENTER: fire `onClick` function and set `activeKey` to current node

Note the difference between the state `active` and `focused`. ENTER is equivalent to the `onClick` event, but focus does not fire `onClick`.

## API

### TreeMenu

| props               | description                                                                                                                              | type                                        | default                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| data                | Data that defines the structure of the tree. You can nest it as many levels as you want, but note that it might cause performance issue. | {[string]:TreeNode} \| TreeNodeInArray[]    | -                                  |
| activeKey           | the node matching this key will be active. Note that you need to provide the complete path (e.g. node-level-1/node-level-2/target-node).| string                                      | ''                                 |
| focusKey            | the node matching this key will be focused. Note that you need to provide the complete path (e.g. node-level-1/node-level-2/target-node)| string                                      | ''                                 |
| initialActiveKey    | set initial state of `activeKey`. Note that you need to provide the complete path (e.g. node-level-1/node-level-2/target-node).         | string                                      | -                                  |
| initialFocusKey     | set initial state of `focusKey`. Note that you need to provide the complete path (e.g. node-level-1/node-level-2/target-node).          | string                                      | -                                  |
| onClickItem         | A callback function that defines the behavior when user clicks on an node                                                                | (Item): void                                | `console.warn`                     |
| debounceTime        | debounce time for searching                                                                                                              | number                                      | 125                                |
| openNodes           | you can pass an array of node names to control the open state of certain branches                                                        | string[]                                    | -                                  |
| initialOpenNodes    | you can pass an array of node names to set some branches open as initial state                                                           | string[]                                    | -                                  |
| locale              | you can provide a function that converts `label` into `string`                                                                           | ({label, ...other}) => string               | ({label}) => label                 |
| hasSearch           | Set to `false` then `children` will not have the prop `search`                                                                           | boolean                                     | true                               |
| matchSearch         | you can define your own search function                                                                                                  | ({label, searchTerm, ...other}) => boolean  | ({label, searchTerm}) => isVisible |
| disableKeyboard     | Disable keyboard navigation                                                                                                              | boolean                                     | false                              |
| children            | a render props that provdes two props: `search`, `items` and `resetOpenNodes`                                                            | (ChildrenProps) => React.ReactNode          | -                                  |

### TreeNode

| props    | description                                                                                                            | type                              | default |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| label    | the rendered text of a Node                                                                                            | string                            | ''      |
| index    | a number that defines the rendering order of this node on the same level; this is not needed if `data` is `TreeNode[]` | number                            | -       |
| nodes    | a node without this property means that it is the last child of its branch                                             | {[string]:TreeNode} \| TreeNode[] | -       |
| ...other | User defined props                                                                                                     | any                               | -       |

### TreeNodeInArray

| props    | description                                                                                                            | type                              | default |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| key      | Node name                                                                                                              | string                            | -       |
| label    | the rendered text of a Node                                                                                            | string                            | ''      |
| nodes    | a node without this property means that it is the last child of its branch                                             | {[string]:TreeNode} \| TreeNode[] | -       |
| ...other | User defined props                                                                                                     | any                               | -       |

### Item

| props    | description                                    | type                      | default |
| -------- | ---------------------------------------------- | ------------------------- | ------- |
| hasNodes | if a `TreeNode` is the last node of its branch | boolean                   | false   |
| isOpen   | if it is showing its children                  | boolean                   | false   |
| level    | the level of the current node (root is zero)   | number                    | 0       |
| key      | key of a `TreeNode`                            | string                    | -       |
| label    | `TreeNode` `label`                             | string                    | -       |
| ...other | User defined props                             | any                       | -       |

### ChildrenProps

| props          | description                                                                                              | type                                   | default |
| -------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------- |
| search         | A function that takes a string to filter the label of the item (only available if `hasSearch` is `true`) | (value: string) => void                | -       |
| searchTerm     | the search term that is currently applied (only available if `hasSearch` is `true`)                      | string                                 | -       |
| items          | An array of `TreeMenuItem`                                                                               | TreeMenuItem[]                         | []      |
| resetOpenNodes | A function that resets the `openNodes`, by default it will close all nodes.  `activeKey` is an optional parameter that will highlight the node at the given path.  `focusKey` is also an optional parameter that will set the focus (for keyboard control) to the given path.  Both activeKey/focusKey must be provided with the complete path (e.g. node-level-1/node-level-2/target-node).  activeKey will not highlight any nodes if not provided.  focusKey will default to activeKey if not provided.                           | (openNodes: string[], activeKey?: string, focusKey?: string) => void          | [],'',''       |

### TreeMenuItem

| props            | description                                                           | type                      | default |
| ---------------- | --------------------------------------------------------------------- | ------------------------- | ------- |
| hasNodes         | if a `TreeNode` is the last node of its branch                        | boolean                   | false   |
| isOpen           | if it is showing its children                                         | boolean                   | false   |
| openNodes        | an array of all the open node names                                   | string[]                  | -       |
| level            | the level of the current node (root is zero)                          | number                    | 0       |
| key              | key of a `TreeNode`                                                   | string                    | -       |
| parent           | key of the parent node                                                | string                    | -       |
| searchTerm       | user provided search term                                             | string                    | -       |
| label            | `TreeNode` `label`                                                    | string                    | -       |
| active           | if current node is being selected                                     | boolean                   | -       |
| focused          | if current node is being focused                                      | boolean                   | -       |
| onClick          | a callback function that is run when the node is clicked              | Function                  | -       |
| toggleNode       | a function that toggles the node (only availavble if it has children) | Function                  | -       |
| ...other         | User defined props                                                    | {[string]: any}           | -       |
