import { isEmpty } from 'lodash';

export interface TreeNodeObject {
  [name: string]: TreeNode;
}

interface LocaleFunctionProps {
  label: string;
  [name: string]: any;
}

export interface TreeNode extends LocaleFunctionProps {
  index: number;
  nodes?: TreeNodeObject;
}

export interface TreeNodeInArray extends LocaleFunctionProps {
  key: string;
  nodes?: TreeNodeInArray[];
}

export type LocaleFunction = (localeFunctionProps: LocaleFunctionProps) => string;

type Data = TreeNodeObject | TreeNodeInArray[];
interface WalkProps {
  data: Data | undefined;
  parent?: string;
  level?: number;
  openNodes: string[];
  searchTerm: string;
  locale?: LocaleFunction;
}

interface BranchProps {
  parent: string;
  level: number;
  openNodes: string[];
  searchTerm: string;
  node: TreeNode | TreeNodeInArray;
  nodeName: string;
  index?: number;
  locale?: LocaleFunction;
}

export interface Item {
  hasNodes: boolean;
  isOpen: boolean;
  level: number;
  key: string;
  label: string;
  [name: string]: any;
}

const validateData = (data: Data | undefined): boolean => !!data && !isEmpty(data);
const getValidatedData = (data: Data | undefined) =>
  validateData(data) ? (data as Data) : [];

const walk = ({ data, ...props }: WalkProps): Item[] => {
  const validatedData = getValidatedData(data);

  const propsWithDefaultValues = { parent: '', level: 0, ...props };
  const handleArray = (dataAsArray: TreeNodeInArray[]) =>
    dataAsArray.reduce((all: Item[], node: TreeNodeInArray, index) => {
      const branchProps = { node, index, nodeName: node.key, ...propsWithDefaultValues };
      const branch = generateBranch(branchProps);
      return [...all, ...branch];
    }, []);

  const handleObject = (dataAsObject: TreeNodeObject) =>
    Object.entries(dataAsObject)
      .sort((a, b) => a[1].index - b[1].index) // sorted by index
      .reduce((all: Item[], [nodeName, node]: [string, TreeNode]) => {
        const branchProps = { node, nodeName, ...propsWithDefaultValues };
        const branch = generateBranch(branchProps);
        return [...all, ...branch];
      }, []);

  return Array.isArray(validatedData)
    ? handleArray(validatedData)
    : handleObject(validatedData);
};

const matchSearch = (label: string, searchTerm: string) => {
  const processString = (text: string): string => text.trim().toLowerCase();
  return processString(label).includes(processString(searchTerm));
};

const defaultLocale = ({ label }: LocaleFunctionProps): string => label;

const generateBranch = ({ node, nodeName, ...props }: BranchProps): Item[] => {
  const { parent, level, openNodes, searchTerm, locale = defaultLocale } = props;

  const { nodes, label: rawLabel = 'unknown', ...nodeProps } = node;
  const key = [parent, nodeName].filter(x => x).join('/');
  const hasNodes = validateData(nodes);
  const isOpen = hasNodes && (openNodes.includes(key) || !!searchTerm);

  const label = locale({ label: rawLabel, ...nodeProps });
  const isVisible = !searchTerm || matchSearch(label, searchTerm);
  const currentItem = { ...props, ...nodeProps, label, hasNodes, isOpen, key };

  const data = getValidatedData(nodes);
  const nextLevelItems = isOpen
    ? walk({ data, ...props, parent: key, level: level + 1 })
    : [];

  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
