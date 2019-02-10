import React, { useState } from 'react';
import { debounce } from 'lodash';

import walk, { TreeNode, Item } from './walk';
import {
  renderItem as defaultRenderItem,
  renderList as defaultRenderList,
  RenderItem,
  RenderList,
} from './renderProps';

type TreeMenuProps = {
  data: { [name: string]: TreeNode };
  activeKey?: string;
  openNodes?: string[];
  onClickItem: (props: Item) => void;
  debounceTime: number;
  renderItem: RenderItem;
  renderList: RenderList;
};

const defaultOnClick = (props: Item) => console.log(props); // eslint-disable-line no-console

type OpenNodesState = [string[], Function];
type SearchTermState = [string, (searchTerm: string) => void];
type ActiveKeyState = [string, (activeKey: string) => void];

const TreeMenu = ({
  data = {},
  onClickItem = defaultOnClick,
  debounceTime = 125,
  renderItem = defaultRenderItem,
  renderList = defaultRenderList,
  ...props
}: TreeMenuProps) => {
  const [openNodes, setOpenNodes]: OpenNodesState = useState([]);
  const [searchTerm, setSearchTerm]: SearchTermState = useState('');
  const [activeKey, setActiveKey]: ActiveKeyState = useState('');

  const onSearch = (value: string) => {
    const search = debounce(
      (searchTerm: string) => setSearchTerm(searchTerm),
      debounceTime
    );
    search(value);
  };

  const toggleNode = (node: string) => {
    if (!props.openNodes) {
      const newOpenNodes = openNodes.includes(node)
        ? openNodes.filter(openNode => openNode !== node)
        : [...openNodes, node];
      setOpenNodes(newOpenNodes);
      setActiveKey(activeKey || node);
    }
  };

  const getOnClickItem = (props: Item) => () => {
    toggleNode(props.key);
    onClickItem(props);
  };

  const loadListItems = (): JSX.Element[] => {
    const items: Item[] = walk({
      data,
      openNodes: props.openNodes || openNodes,
      searchTerm,
    });

    return items.map(({ key, ...itemProps }) => {
      const onClick = getOnClickItem({ key, ...itemProps });
      const active = key === activeKey || key === props.activeKey;

      return renderItem({ onClick, active, key, ...itemProps });
    });
  };
  return (
    <>
      {renderList({
        search: onSearch,
        items: data ? loadListItems() : [],
      })}
    </>
  );
};

export default TreeMenu;
