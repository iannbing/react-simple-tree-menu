type TreeNodeObject = { [key: string]: TreeNode };

export type TreeNode = {
  label: string;
  index: number;
  nodes?: TreeNodeObject;
  [name: string]: any;
};

type WalkProps = {
  data?: TreeNodeObject;
  parentKey?: string;
  level?: number;
  openNodes: string[];
  searchTerm: string;
};

type BranchProps = {
  parentKey: string;
  level: number;
  openNodes: string[];
  searchTerm: string;
  node: TreeNode;
  key: string;
};

export type Item = {
  isOpen: boolean;
  nodes?: TreeNodeObject;
  key: string;
  level: number;
  label: string;
};

const walk = ({ data = {}, parentKey = '', level = 0, ...props }: WalkProps): Item[] =>
  data
    ? Object.entries(data)
        .sort((a, b) => a[1].index - b[1].index)
        .reduce(
          (all: Item[], [key, node]: [string, TreeNode]) => [
            ...all,
            ...generateBranch({
              node,
              key,
              parentKey,
              level,
              ...props,
            }),
          ],
          []
        )
    : [];

const generateBranch = ({ node, key, ...props }: BranchProps): Item[] => {
  const { parentKey, level, openNodes, searchTerm } = props;

  const { nodes, label } = node;
  const currentKey = [parentKey, key].filter(x => x).join('/');
  const isOpen = !!nodes && (openNodes.includes(currentKey) || !!searchTerm);
  const isVisible =
    !searchTerm || label.toLowerCase().includes(searchTerm.trim().toLowerCase());

  const currentItem = {
    ...props,
    ...node,
    isOpen,
    key: currentKey,
  };
  const nextLevelItems = walk({
    data: isOpen ? nodes : {},
    ...props,
    parentKey: currentKey,
    level: level + 1,
  });
  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
