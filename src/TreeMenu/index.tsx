import * as React from 'react';
import { debounce } from 'lodash';

import walk, { TreeNode, Item } from './walk';
import { defaultChildren, TreeMenuChildren, TreeMenuItem } from './renderProps';

type TreeMenuProps = {
  data: { [name: string]: TreeNode };
  activeKey?: string;
  openNodes?: string[];
  onClickItem: (props: Item) => void;
  debounceTime: number;
  children: TreeMenuChildren;
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
  };

  state: TreeMenuState = { openNodes: [], searchTerm: '', activeKey: '' };

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
      const activeKey = this.props.activeKey || node;
      this.setState({ openNodes: newOpenNodes, activeKey });
    }
  };

  generateItems = (): TreeMenuItem[] => {
    const { data, onClickItem } = this.props;
    const { searchTerm } = this.state;
    const openNodes = this.props.openNodes || this.state.openNodes;
    const activeKey = this.props.activeKey || this.state.activeKey;

    const items: Item[] = walk({ data, openNodes, searchTerm });

    return items.map(props => {
      const { key } = props;
      const onClick = () => {
        this.toggleNode(props.key);
        onClickItem(props);
      };
      return {
        ...props,
        active: key === activeKey,
        onClick,
      };
    });
  };

  render() {
    const { data, children } = this.props;

    const search = this.onSearch;
    const items = data ? this.generateItems() : [];
    const renderedChildren = children || defaultChildren;

    return renderedChildren({ search, items });
  }
}

export default TreeMenu;
