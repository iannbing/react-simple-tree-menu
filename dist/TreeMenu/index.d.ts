import React from 'react';
import { TreeNode, Item, TreeNodeInArray, LocaleFunction, MatchSearchFunction } from './walk';
import { TreeMenuChildren, TreeMenuItem } from './renderProps';
export declare type TreeMenuProps = {
    data: {
        [name: string]: TreeNode;
    } | TreeNodeInArray[];
    activeKey?: string;
    focusKey?: string;
    initialActiveKey?: string;
    initialFocusKey?: string;
    initialOpenNodes?: string[];
    openNodes?: string[];
    resetOpenNodesOnDataUpdate?: boolean;
    hasSearch?: boolean;
    cacheSearch?: boolean;
    onClickItem?: (props: Item) => void;
    debounceTime?: number;
    children?: TreeMenuChildren;
    locale?: LocaleFunction;
    matchSearch?: MatchSearchFunction;
    disableKeyboard?: boolean;
};
declare type TreeMenuState = {
    openNodes: string[];
    searchTerm: string;
    activeKey: string;
    focusKey: string;
};
declare class TreeMenu extends React.Component<TreeMenuProps, TreeMenuState> {
    static defaultProps: TreeMenuProps;
    state: TreeMenuState;
    componentDidUpdate(prevProps: TreeMenuProps): void;
    resetOpenNodes: (newOpenNodes?: string[] | undefined, activeKey?: string | undefined, focusKey?: string | undefined) => void;
    search: (value: string) => void;
    toggleNode: (node: string) => void;
    generateItems: () => TreeMenuItem[];
    getKeyDownProps: (items: TreeMenuItem[]) => {
        up: () => void;
        down: () => void;
        left: () => void;
        right: () => void;
        enter: () => void;
    };
    render(): JSX.Element;
}
export default TreeMenu;
//# sourceMappingURL=index.d.ts.map