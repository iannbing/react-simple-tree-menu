type TreeNodeObject = { [name: string]: TreeNode };

export type TreeNode = {
  label: string;
  key: string;
  index: number;
  nodes?: TreeNodeObject;
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
  nodePath: string;
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

  const { nodes, label } = node;
  const nodePath = [parent, nodeName].filter(x => x).join('/');
  const isOpen = !!nodes && (openNodes.includes(nodePath) || !!searchTerm);
  const isVisible = !searchTerm || (label && matchSearch(label, searchTerm));

  const currentItem = {
    isOpen,
    nodePath,
    ...props,
    ...node,
  };
  const nextLevelItems = walk({
    data: isOpen ? nodes : {},
    ...props,
    parent: nodePath,
    level: level + 1,
  });
  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
