export type TreeNode = {
  label: string;
  key: string;
  index: number;
  nodes: { [name: string]: TreeNode };
};

type WalkProps = {
  data: { [name: string]: TreeNode } | null;
  parent?: string;
  level?: number;
  openNodes: string[];
  searchTerm: string;
};

type BranchProps = {
  node: TreeNode;
  nodeName: string;
  parent: string;
  level: number;
  openNodes: string[];
  searchTerm: string;
};

export type Item = {
  isOpen: boolean;
  nodes?: { [name: string]: TreeNode };
  key: string;
  level: number;
  nodePath: string;
  label: string;
};

const walk = ({ data, parent = '', level = 0, ...props }: WalkProps): Item[] =>
  data
    ? Object.entries(data)
        .sort((a, b) => a[1].index - b[1].index)
        .reduce(
          (all: Item[], [nodeName, node]: [string, TreeNode]) => [
            ...all,
            ...(node.key
              ? generateBranch({ node, nodeName, parent, level, ...props })
              : []),
          ],
          []
        )
    : [];

const generateBranch = (props: BranchProps): Item[] => {
  const { node, nodeName, parent, level, openNodes, searchTerm } = props;
  const { nodes, label } = node;
  const nodePath = [parent, nodeName].filter(x => x).join('/');
  const isOpen = !!nodes && (openNodes.includes(nodePath) || !!searchTerm);
  const isMatchingSearchTerm =
    !searchTerm && label.toLowerCase().includes(searchTerm.trim().toLowerCase());

  const currentItem = {
    isOpen,
    nodePath,
    ...props,
    ...node,
  };
  const nextLevelItems = isOpen
    ? walk({ data: nodes, ...props, parent: nodePath, level: level + 1 })
    : [];

  return isMatchingSearchTerm ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
