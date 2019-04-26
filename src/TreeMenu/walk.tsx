import { isEmpty } from 'lodash';

export type TreeNodeObject = { [name: string]: TreeNode };

export type TreeNode = {
  label: string;
  index: number;
  nodes?: TreeNodeObject;
  [name: string]: any;
};

export type TreeNodeInArray = {
  label: string;
  key: string;
  nodes?: TreeNodeInArray[];
  [name: string]: any;
};

type WalkProps = {
  data: TreeNodeObject | TreeNodeInArray[];
  parent?: string;
  level?: number;
  openNodes: string[];
  searchTerm: string;
};

type BranchProps = {
  parent: string;
  level: number;
  openNodes: string[];
  searchTerm: string;
  node: TreeNode | TreeNodeInArray;
  nodeName: string;
  index?: number;
};

export type Item = {
  hasNodes: boolean;
  isOpen: boolean;
  level: number;
  key: string;
  label: string | JSX.Element;
  [name: string]: any;
};

const walk = ({ data = {}, ...props }: WalkProps): Item[] => {
  const propsWithDefaultValues = { parent: '', level: 0, ...props };

  return Array.isArray(data)
    ? (data as TreeNodeInArray[]).reduce(
        (all: Item[], node: TreeNodeInArray, index) => [
          ...all,
          ...generateBranch({
            node,
            nodeName: node.key,
            index,
            ...propsWithDefaultValues,
          }),
        ],
        []
      )
    : Object.entries(data as TreeNodeObject)
        .sort((a, b) => a[1].index - b[1].index)
        .reduce(
          (all: Item[], [nodeName, node]: [string, TreeNode]) => [
            ...all,
            ...generateBranch({ node, nodeName, ...propsWithDefaultValues }),
          ],
          []
        );
};

const matchSearch = (label: string, searchTerm: string) => {
  const processString = (text: string) => text.trim().toLowerCase();
  return processString(label).includes(processString(searchTerm));
};

const generateBranch = ({ node, nodeName, ...props }: BranchProps): Item[] => {
  const { parent, level, openNodes, searchTerm } = props;

  const { nodes, ...nodeProps } = node;
  const key = [parent, nodeName].filter(x => x).join('/');
  const hasNodes = !!nodes && !isEmpty(nodes);
  const isOpen = hasNodes && (openNodes.includes(key) || !!searchTerm);
  const label = node.label || 'unknown';
  const isVisible = !searchTerm || matchSearch(label, searchTerm);

  const currentItem = { ...props, ...nodeProps, hasNodes, isOpen, key };
  const data = Array.isArray(nodes)
    ? (nodes as TreeNodeInArray[])
    : (nodes as TreeNodeObject);
  const nextLevelItems = isOpen
    ? walk({ data, ...props, parent: key, level: level + 1 })
    : [];
  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
