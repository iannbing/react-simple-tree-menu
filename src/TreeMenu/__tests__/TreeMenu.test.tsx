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
  it('should render the roots only', () => {
    const wrapper = shallow(
      <TreeViewMenu data={mockData} activeKey="releasenotes/desktop-modeler/7" />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
