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
  initialActiveKey?: string;
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
  };

  onSearch = (value: string) => {
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

    const items: Item[] = walk({ data, openNodes, searchTerm, locale, matchSearch });

    return items.map(props => {
      const { key, hasNodes } = props;
      const onClick = () => {
        const activeKey = this.props.activeKey || props.key;
        this.setState({ activeKey });
        onClickItem(props);
      };
      const toggleNode = () => {
        this.toggleNode(props.key);
      };
      return {
        ...props,
        active: key === activeKey,
        onClick,
        toggleNode: hasNodes ? toggleNode : undefined,
      };
    });
  };

  render() {
    const { data, children, hasSearch } = this.props;

    const search = hasSearch ? this.onSearch : undefined;
    const items = data ? this.generateItems() : [];
    const renderedChildren = children || defaultChildren;

    return renderedChildren({ search, items });
  }
}

export default TreeMenu;
