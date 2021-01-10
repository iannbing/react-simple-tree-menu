import React from 'react';
import { shallow, mount } from 'enzyme';

import TreeMenu from '../index';

const mockData = {
  atd: {
    label: 'ATS Guide',
    key: 'ats',
    index: 1, // ATS Guide should be after Release Notes
  },
  releasenotes: {
    label: 'Release Notes',
    key: 'releasenotes',
    index: 0, // Release Notes should be first
    nodes: {
      'desktop-modeler': {
        label: 'Desktop Modeler',
        key: 'releasenotes/desktop-modeler',
        index: 0,
        nodes: {
          7: {
            label: '7',
            key: 'releasenotes/desktop-modeler/7',
            index: 0,
            nodes: {
              '7.0': {
                label: '7.0',
                key: 'releasenotes/desktop-modeler/7.0',
                index: 0,
              },
            },
          },
        },
      },
    },
  },
};
const mockDataWithSlashes = [
  {
    key: 'item1/a',
    label: 'Item 1 (a)',
  },
  {
    key: 'item2/a',
    label: 'Item 2 (a)',
    nodes: [
      {
        key: 'b',
        label: 'Item 2 ab',
        nodes:[
          {
            key: 'b/1',
            label: 'Item 2 ab:1'
          },
          {
            key: 'b/2',
            label: 'Item 2 ab:2'
          },
        ],
      },
      {
        key: 'c',
        label: 'Item 2 ac',
      },
    ],
  },
];

describe('TreeMenu', () => {
  it('should render the level-1 nodes by default', () => {
    const wrapper = mount(<TreeMenu data={mockData} />);

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('li').length).toEqual(2);
  });
  it('should open specified nodes', () => {
    const wrapper = mount(
      <TreeMenu
        data={mockData}
        openNodes={['releasenotes', 'releasenotes/desktop-modeler']}
      />
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('li').length).toEqual(4);
  });
  it('should highlight the active node', () => {
    const activeKey = 'releasenotes/desktop-modeler/7';
    const wrapper = mount(
      <TreeMenu
        data={mockData}
        activeKey={activeKey}
        openNodes={['releasenotes', 'releasenotes/desktop-modeler']}
      />
    );
    const highlightedElement = wrapper
      .findWhere(node => node.key() === activeKey)
      .childAt(0)
      .get(0);

    expect(wrapper).toMatchSnapshot();
    expect(highlightedElement.props.className).toContain('rstm-tree-item--active');
  });
  it('should work with an alternative key separator', () => {
    const wrapper = mount(
      <TreeMenu
        data={mockDataWithSlashes}
        openNodes={['item2/a', 'item2/a;b']}
        keySeparator=";"
      />
    );
    const targetNodeWithAlternativeKey = wrapper.findWhere(node => node.key() === 'item2/a;b').get(0);
    expect(targetNodeWithAlternativeKey).not.toBeUndefined();
    const targetNodeWithAlternativeKey2 = wrapper.findWhere(node => node.key() === 'item2/a;b;b/2').get(0);
    expect(targetNodeWithAlternativeKey2).not.toBeUndefined();
    const targetNodeWithDefaultKey = wrapper.findWhere(node => node.key() === 'item2/a/b').get(0);
    expect(targetNodeWithDefaultKey).toBeUndefined();
  });
  it('should trigger onClickItem when a node is clicked', () => {
    const mockOnClickItem = jest.fn();
    const wrapper = shallow(
      <TreeMenu data={mockData} onClickItem={mockOnClickItem} />
    );

    const targetNode = wrapper.findWhere(node => node.key() === 'releasenotes');
    targetNode.simulate('click');
    expect(mockOnClickItem.mock.calls.length).toEqual(1);
    expect(mockOnClickItem).toHaveBeenCalledWith({
      hasNodes: true,
      index: 0,
      isOpen: false,
      key: 'releasenotes',
      keySeparator: '/',
      label: 'Release Notes',
      level: 0,
      openNodes: [],
      parent: '',
      searchTerm: '',
    });
  });
});
