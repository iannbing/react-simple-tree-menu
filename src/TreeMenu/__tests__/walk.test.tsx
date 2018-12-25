import walk from '../walk';

const mockData = {
  atd: {
    label: 'ATS Guide',
    url: 'ats',
    index: 1, // ATS Guide should be after Release Notes
  },
  releasenotes: {
    label: 'Release Notes',
    url: 'releasenotes',
    index: 0, // Release Notes should be first
    nodes: {
      'desktop-modeler': {
        label: 'Desktop Modeler',
        url: 'releasenotes/desktop-modeler',
        index: 0,
        nodes: {
          7: {
            label: '7',
            url: 'releasenotes/desktop-modeler/7',
            index: 0,
            nodes: {
              '7.0': {
                label: '7.0',
                url: 'releasenotes/desktop-modeler/7.0',
                index: 0,
              },
            },
          },
        },
      },
    },
  },
};

describe('walk', () => {
  it('should transpose data to a desired shape', () => {
    const result = walk({ data: mockData, openNodes: [], searchTerm: '7' });

    const expected = [
      {
        key: 'releasenotes/desktop-modeler/7',
        index: 0,
        isOpen: true,
        url: 'releasenotes/desktop-modeler/7',
        label: '7',
        level: 2,
        nodes: {
          '7.0': {
            index: 0,
            url: 'releasenotes/desktop-modeler/7.0',
            label: '7.0',
          },
        },
        openNodes: [],
        parentKey: 'releasenotes/desktop-modeler',
        searchTerm: '7',
      },
      {
        key: 'releasenotes/desktop-modeler/7/7.0',
        index: 0,
        isOpen: false,
        url: 'releasenotes/desktop-modeler/7.0',
        label: '7.0',
        level: 3,
        openNodes: [],
        parentKey: 'releasenotes/desktop-modeler/7',
        searchTerm: '7',
      },
    ];

    expect(result).toEqual(expected);
  });
});
