import isEmpty from 'is-empty';
import memoize from 'fast-memoize';

export interface TreeNodeObject {
  [name: string]: TreeNode;
}

interface LocaleFunctionProps {
  label: string;
  [name: string]: any;
}

interface MatchSearchFunctionProps extends LocaleFunctionProps {
  searchTerm: string;
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
export type MatchSearchFunction = (
  matchSearchFunctionProps: MatchSearchFunctionProps
) => boolean;

type Data = TreeNodeObject | TreeNodeInArray[];
interface WalkProps {
  data: Data | undefined;
  parent?: string;
  level?: number;
  openNodes: string[];
  searchTerm: string;
  locale?: LocaleFunction;
  matchSearch?: MatchSearchFunction;
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
  matchSearch?: MatchSearchFunction;
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

const defaultMatchSearch = ({ label, searchTerm }: MatchSearchFunctionProps) => {
  const processString = (text: string): string => text.trim().toLowerCase();
  return processString(label).includes(processString(searchTerm));
};

const defaultLocale = ({ label }: LocaleFunctionProps): string => label;

const generateBranch = ({
  node,
  nodeName,
  matchSearch = defaultMatchSearch,
  locale = defaultLocale,
  ...props
}: BranchProps): Item[] => {
  const { parent, level, openNodes, searchTerm } = props;

  const { nodes, label: rawLabel = 'unknown', ...nodeProps } = node;
  const key = [parent, nodeName].filter(x => x).join('/');
  const hasNodes = validateData(nodes);
  const isOpen = hasNodes && (openNodes.includes(key) || !!searchTerm);

  const label = locale({ label: rawLabel, ...nodeProps });
  const isVisible = !searchTerm || matchSearch({ label, searchTerm, ...nodeProps });
  const currentItem = { ...props, ...nodeProps, label, hasNodes, isOpen, key };

  const data = getValidatedData(nodes);
  const nextLevelItems = isOpen
    ? walk({ data, locale, matchSearch, ...props, parent: key, level: level + 1 })
    : [];

  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export const fastWalk = memoize(walk);
export const slowWalk = walk;
