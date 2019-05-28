import React from 'react';
import { debounce } from 'lodash';

import walk, {
  TreeNode,
  Item,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
} from './walk';
import { defaultChildren, TreeMenuChildren, TreeMenuItem } from './renderProps';

type TreeMenuProps = {
  data: { [name: string]: TreeNode } | TreeNodeInArray[];
  activeKey?: string;
  focusKey?: string;
  initialActiveKey?: string;
  initialFocusKey?: string;
  initialOpenNodes?: string[];
  openNodes?: string[];
  hasSearch?: boolean;
  onClickItem: (props: Item) => void;
  debounceTime: number;
  children: TreeMenuChildren;
  locale?: LocaleFunction;
  matchSearch?: MatchSearchFunction;
};

type TreeMenuState = {
  openNodes: string[];
  searchTerm: string;
  activeKey: string;
  focusKey: string;
};

const defaultOnClick = (props: Item) => console.log(props); // eslint-disable-line no-console

class TreeMenu extends React.Component<TreeMenuProps, TreeMenuState> {
  static defaultProps: TreeMenuProps = {
    data: {},
    onClickItem: defaultOnClick,
    debounceTime: 125,
    children: defaultChildren,
    hasSearch: true,
  };

  state: TreeMenuState = {
    openNodes: this.props.initialOpenNodes || [],
    searchTerm: '',
    activeKey: this.props.initialActiveKey || '',
    focusKey: this.props.initialFocusKey || '',
  };

  search = (value: string) => {
    const { debounceTime } = this.props;
    const search = debounce(
      (searchTerm: string) => this.setState({ searchTerm }),
      debounceTime
    );
    search(value);
  };

  toggleNode = (node: string) => {
    if (!this.props.openNodes) {
      const { openNodes } = this.state;
      const newOpenNodes = openNodes.includes(node)
        ? openNodes.filter(openNode => openNode !== node)
        : [...openNodes, node];
      this.setState({ openNodes: newOpenNodes });
    }
  };

  generateItems = (): TreeMenuItem[] => {
    const { data, onClickItem, locale, matchSearch } = this.props;
    const { searchTerm } = this.state;
    const openNodes = this.props.openNodes || this.state.openNodes;
    const activeKey = this.props.activeKey || this.state.activeKey;

    const items: Item[] = data
      ? walk({ data, openNodes, searchTerm, locale, matchSearch })
      : [];

    return items.map(item => {
      const focusKey = items[0] ? items[0].key : '';
      const focus = item.key === focusKey;
      const active = item.key === activeKey;
      const onClick = () => {
        const activeKey = this.props.activeKey || item.key;
        this.setState({ activeKey });
        onClickItem(item);
      };
      const toggleNode = item.hasNodes ? () => this.toggleNode(item.key) : undefined;
      return { ...item, focus, active, onClick, toggleNode };
    });
  };

  render() {
    const { children, hasSearch } = this.props;
    const items = this.generateItems();
    const renderedChildren = children || defaultChildren;

    return renderedChildren(hasSearch ? { search: this.search, items } : { items });
  }
}

export default TreeMenu;
