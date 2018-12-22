type TreeNodeObject = { [name: string]: TreeNode };
export type TreeNode = {
  label: string;
  key: string;
  index: number;
  nodes: TreeNodeObject;
};

type WalkProps = {
  data: TreeNodeObject;
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
  nodes?: { [name: string]: TreeNode };
  key: string;
  level: number;
  nodePath: string;
  label: string;
};

const walk = ({ data = {}, parent = '', level = 0, ...props }: WalkProps): Item[] =>
  Object.entries(data)
    .sort((a, b) => a[1].index - b[1].index)
    .reduce(
      (all: Item[], [nodeName, node]: [string, TreeNode]) => [
        ...all,
        ...(node.key
          ? generateBranch({
              node,
              nodeName,
              parent,
              level,
              ...props,
            })
          : []),
      ],
      []
    );

const generateBranch = (props: BranchProps): Item[] => {
  const { node, nodeName, parent, level, openNodes, searchTerm } = props;
  const { nodes, label } = node;
  const nodePath = [parent, nodeName].filter(x => x).join('/');
  const isOpen = !!nodes && (openNodes.includes(nodePath) || !!searchTerm);
  const isVisible =
    !searchTerm || label.toLowerCase().includes(searchTerm.trim().toLowerCase());

  const currentItem = {
    isOpen,
    nodePath,
    ...props,
    ...node,
  };
  const nextLevelItems = isOpen
    ? walk({ data: nodes, ...props, parent: nodePath, level: level + 1 })
    : [];

  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
