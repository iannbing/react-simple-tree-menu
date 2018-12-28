type TreeNodeObject = { [name: string]: TreeNode };

export type TreeNode = {
  label: string;
  index: number;
  nodes?: TreeNodeObject;
  [name: string]: any;
};

type WalkProps = {
  data?: TreeNodeObject;
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
  node: TreeNode;
  nodeName: string;
};

export type Item = {
  isOpen: boolean;
  nodes?: TreeNodeObject;
  key: string;
  level: number;
  label: string;
};

const walk = ({ data = {}, parent = '', level = 0, ...props }: WalkProps): Item[] =>
  data
    ? Object.entries(data)
        .sort((a, b) => a[1].index - b[1].index)
        .reduce(
          (all: Item[], [nodeName, node]: [string, TreeNode]) => [
            ...all,
            ...generateBranch({
              node,
              nodeName,
              parent,
              level,
              ...props,
            }),
          ],
          []
        )
    : [];

const matchSearch = (label: string, searchTerm: string) => {
  const processString = (text: string) => text.trim().toLowerCase();
  return processString(label).includes(processString(searchTerm));
};

const generateBranch = ({ node, nodeName, ...props }: BranchProps): Item[] => {
  const { parent, level, openNodes, searchTerm } = props;

  const { nodes } = node;
  const key = [parent, nodeName].filter(x => x).join('/');
  const isOpen = !!nodes && (openNodes.includes(key) || !!searchTerm);
  const label = node.label || 'unknown';
  const isVisible = !searchTerm || matchSearch(label, searchTerm);

  const currentItem = {
    ...props,
    ...node,
    isOpen,
    key,
  };
  const nextLevelItems = walk({
    data: isOpen ? nodes : {},
    ...props,
    parent: key,
    level: level + 1,
  });
  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
