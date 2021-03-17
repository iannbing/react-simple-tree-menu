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
export declare type LocaleFunction = (localeFunctionProps: LocaleFunctionProps) => string;
export declare type MatchSearchFunction = (matchSearchFunctionProps: MatchSearchFunctionProps) => boolean;
declare type Data = TreeNodeObject | TreeNodeInArray[];
interface WalkProps {
    data: Data | undefined;
    parent?: string;
    level?: number;
    openNodes: string[];
    searchTerm: string;
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
export declare const fastWalk: ({ data, ...props }: WalkProps) => Item[];
export declare const slowWalk: ({ data, ...props }: WalkProps) => Item[];
export {};
//# sourceMappingURL=walk.d.ts.map