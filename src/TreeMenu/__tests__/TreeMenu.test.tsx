import * as React from 'react';
import { shallow } from 'enzyme';

import TreeViewMenu from '../index';

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

describe('TreeViewMenu', () => {
  it('should render the level-1 nodes by default', () => {
    const wrapper = shallow(<TreeViewMenu data={mockData} />);

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('li').length).toEqual(2);
  });
  it('should open specified nodes', () => {
    const wrapper = shallow(
      <TreeViewMenu
        data={mockData}
        openNodes={['releasenotes', 'releasenotes/desktop-modeler']}
      />
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('li').length).toEqual(4);
  });
  it('should highlight the active node', () => {
    const activeKey = 'releasenotes/desktop-modeler/7';
    const highLightColor = 'white';
    const wrapper = shallow(
      <TreeViewMenu
        data={mockData}
        activeKey={activeKey}
        openNodes={['releasenotes', 'releasenotes/desktop-modeler']}
      />
    );
    const highlightedElement = wrapper.findWhere(node => node.key() === activeKey).get(0);

    expect(wrapper).toMatchSnapshot();
    expect(highlightedElement.props.style.color).toEqual(highLightColor);
  });
});
