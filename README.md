# react-simple-tree-view-menu

A simple React Tree Menu component

## Usage

To generate a `TreeMenu`, you need to provide data in the following structure.

```javascript
// as an array
const treeData = [
  {
    key: 'releasenotes',
    label: 'Release Notes',
    url: 'releasenotes', // you can pass along any props you need
    nodes: [
      {
        key: 'desktop-modeler',
        label: 'Desktop Modeler',
        url: 'releasenotes/desktop-modeler',
        nodes: [
          {
            key: '7',
            label: '7',
            url: 'releasenotes/desktop-modeler/7',
            nodes: [
              {
                key: '7.0',
                label: '7.0',
                url: 'releasenotes/desktop-modeler/7.0',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'atd',
    label: 'ATS Guide',
    url: 'ats',
  },
];
// or as an object
const treeData = {
  releasenotes: {             // key
    label: 'Release Notes',
    index: 0,                 // decide the rendering order on the same level
    url: 'releasenotes',
    nodes: {
      'desktop-modeler': {
        label: 'Desktop Modeler',
        index: 0,
        url: 'releasenotes/desktop-modeler',
        nodes: {
          7: {
            label: '7',
            index: 0,
            url: 'releasenotes/desktop-modeler/7',
            nodes: {
              '7.0': {
                label: '7.0',
                index: 0,
                url: 'releasenotes/desktop-modeler/7.0',
              },
            },
          },
        },
      },
    },
  },
  atd: {
    label: 'ATS Guide',
    index: 1,
    url: 'ats',
  },
};

```

And then import `TreeMenu` and use it. By default you only need to provide `data`. You can have more control over the behaviors of the components using the provided API.

```jsx
<TreeMenu data={treeData} />
```

## API

TreeViewMenu

| props        | description                                                                                                                              | type                                   | default        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------- |
| data         | Data that defines the structure of the tree. You can nest it as many levels as you want, but note that it might cause performance issue. | {[key: string]:TreeNode} \| TreeNode[] | -              |
| activeKey    | the node matching this key will be highlighted                                                                                           | string                                 | ''             |
| onClickItem  | A callback function that defines the behavior when user clicks on an node                                                                | ({node, label, key}): void             | `console.warn` |
| debounceTime | debounce time for searching                                                                                                              | number                                 | 125            |
| renderItem   | a render props that renders the list item per `TreeNode`                                                                                 | (RenderItemProps) => React.ReactNode   | -              |
| renderList   | a render props that renders the whole tree menu; `items` is an array of rendered `TreeNode`s                                             | (RenderListProps) => React.ReactNode   | -              |
| openNodes    | you can pass an array of node names to make the branches open                                                                            | string[]                               | null           |

TreeNode

| props | description                                                                                                            | type                              | default |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| key   | Node name                                                                                                              | string                            | -       |
| label | the rendered text of a Node                                                                                            | string                            | ''      |
| index | a number that defines the rendering order of this node on the same level; this is not needed if `data` is `TreeNode[]` | number                            | -       |
| nodes | a node without this property means that it is the last child of its branch                                             | {[string]:TreeNode} \| TreeNode[] | -       |

RenderItemProps

| props    | description                                              | type     | default |
| -------- | -------------------------------------------------------- | -------- | ------- |
| hasNodes | if a `TreeNode` is the last node of its branch           | boolean  | false   |
| isOpen   | if it is showing its children                            | boolean  | false   |
| level    | the level of the current node (root is zero)             | number   | 0       |
| onClick  | a callback function that is run when the node is clicked | Function | -       |
| active   | if current node is being selected                        | boolean  | -       |
| key      | key of a `TreeNode`                                      | string   | -       |
| label    | `TreeNode` `label`                                       | string   | -       |

RenderListProps

| props  | description                                                    | type                    | default |
| ------ | -------------------------------------------------------------- | ----------------------- | ------- |
| search | A function that takes a string to filter the label of the item | (value: string) => void | -       |
| items  | The rendered Item from the renderItem function                 | ReactNode[]             | []      |

## Dependencies

- [emotion](https://emotion.sh/): for adding stylings to the default DOM elements (i.e. default `renderItem`, `renderSearch` and `renderGroup`).

This Demo application is built with [Create React App](https://github.com/facebook/create-react-app) version 2. [react-app-rewired](https://github.com/timarney/react-app-rewired) and [customize-cra](https://github.com/arackaf/customize-cra) are used in order to configure `babel` without ejection. [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) is used for only importing used modules to reduce bundle size, this allows using `Lodash` when you only want to use light-weight functions like `get` and `merge`.

NOTE: configure `REACT_APP_BUNDLE_VISUALIZE=true` in `.env` and then run `yarn build` to see the actual bundle size.

## Code conventions

- [eslint-config-react-airbnb-prettier](https://github.com/iannbing/eslint-config-react-airbnb-prettier).
