import * as React from 'react';
import { debounce } from 'lodash';

import walk, { TreeNode, Item } from './walk';
import {
  renderItem as defaultRenderItem,
  renderList as defaultRenderList,
} from './renderProps';

const defaultOnClick = props => console.log(props); // eslint-disable-line no-console

type TreeMenuProps = {
  data: { [name: string]: TreeNode };
  activeKey: string;
  onClickItem: Function;
  debounceTime: number;
  renderItem: Function;
  renderList: Function;
};

type TreeMenuState = {
  openNodes: string[];
  searchTerm: string;
};

class TreeMenu extends React.Component<TreeMenuProps, TreeMenuState> {
  static defaultProps: TreeMenuProps = {
    data: {},
    activeKey: '',
    onClickItem: defaultOnClick,
    debounceTime: 125,
    renderItem: defaultRenderItem,
    renderList: defaultRenderList,
  };

  state: TreeMenuState = { openNodes: [], searchTerm: '' };

  onSearch = (value: string) => {
    const { debounceTime } = this.props;
    const search = debounce(
      (searchTerm: string) => this.setState({ searchTerm }),
      debounceTime
    );
    search(value);
  };

  toggleNode = (node: string) => {
    const { openNodes } = this.state;
    if (openNodes.includes(node)) {
      this.setState({
        openNodes: openNodes.filter(openNode => openNode !== node),
      });
    } else {
      this.setState({ openNodes: [...openNodes, node] });
    }
  };

  getOnClickItem = props => () => {
    const { onClickItem } = this.props;
    onClickItem(props);
    this.toggleNode(props.nodePath);
  };

  loadListItems = () => {
    const { data, activeKey, renderItem } = this.props;
    const { openNodes, searchTerm } = this.state;

    const items: Item[] = walk({ data, openNodes, searchTerm });

    return items.map(({ isOpen, nodes, key, level, nodePath, label }) => {
      const onClick = this.getOnClickItem({ nodePath, label, key });
      return renderItem({
        hasSubItems: !!nodes,
        isOpen,
        level,
        onClick,
        active: key === activeKey,
        key: nodePath,
        label,
      });
    });
  };

  render() {
    const { data, renderList } = this.props;
    return (
      <>
        {renderList({
          search: this.onSearch,
          items: data ? this.loadListItems() : [],
        })}
      </>
    );
  }
}

export default TreeMenu;
