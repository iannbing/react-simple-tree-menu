import { slowWalk, fastWalk, TreeNode, TreeNodeObject, TreeNodeInArray } from '../walk';

const mockDataInObject: TreeNodeObject = {
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
                nodes: {},
              },
            },
          },
        },
      },
    },
  },
};

const mockDataInArray: TreeNodeInArray[] = [
  {
    key: 'releasenotes',
    label: 'Release Notes',
    url: 'releasenotes',
    nodes: [
      {
        key: 'desktop-modeler',
        label: 'Desktop Modeler',
        url: 'releasenotes/desktop-modeler',
        nodes: [
          {
            key: '7',
            label: '7',
            url: 'releasenotes/desktop-modeler/7',
            nodes: [
              {
                key: '7.0',
                label: '7.0',
                url: 'releasenotes/desktop-modeler/7.0',
                nodes: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'atd',
    label: 'ATS Guide',
    url: 'ats',
  },
];

const expectedOutcome = [
  {
    index: 0,
    isOpen: true,
    key: 'releasenotes/desktop-modeler/7',
    url: 'releasenotes/desktop-modeler/7',
    label: '7',
    level: 2,
    hasNodes: true,
    openNodes: [],
    parent: 'releasenotes/desktop-modeler',
    searchTerm: '7',
  },
  {
    index: 0,
    isOpen: false,
    key: 'releasenotes/desktop-modeler/7/7.0',
    url: 'releasenotes/desktop-modeler/7.0',
    label: '7.0',
    level: 3,
    hasNodes: false,
    openNodes: [],
    parent: 'releasenotes/desktop-modeler/7',
    searchTerm: '7',
  },
];

const hasNodesMockDataInObject: TreeNodeObject = {
  A: {
    label: 'A',
    index: 0,
    nodes: {
      B: {
        label: 'B',
        index: 0,
      },
    },
  },
  C: {
    label: 'C',
    index: 1,
    hasNodes: true,
  },
};

const hasNodesMockDataInArray: TreeNodeInArray[] = [
  {
    key: 'A',
    label: 'A',
    nodes: [
      {
        key: 'B',
        label: 'B',
        nodes: [],
      },
    ],
  },
  {
    key: 'C',
    label: 'C',
    hasNodes: true,
  },
];

const hasNodesExpectedOutcome = [
  {
    index: 0,
    isOpen: false,
    key: 'A',
    label: 'A',
    level: 0,
    hasNodes: true,
    openNodes: [],
    parent: '',
    searchTerm: '',
  },
  {
    index: 1,
    isOpen: false,
    key: 'C',
    label: 'C',
    level: 0,
    hasNodes: true,
    openNodes: [],
    parent: '',
    searchTerm: '',
  },
];

describe('slowWalk', () => {
  it('should transpose the data object to a desired shape', () => {
    const result = slowWalk({ data: mockDataInObject, openNodes: [], searchTerm: '7' });
    expect(result).toEqual(expectedOutcome);
  });
  it('should transpose the data array to a desired shape', () => {
    const result = slowWalk({ data: mockDataInArray, openNodes: [], searchTerm: '7' });
    expect(result).toEqual(expectedOutcome);
  });

  it('should transpose the data object with supplied hasNodes', () => {
    const result = slowWalk({
      data: hasNodesMockDataInObject,
      openNodes: [],
      searchTerm: '',
    });
    expect(result).toEqual(hasNodesExpectedOutcome);
  });
  it('should transpose the data array with supplied hasNodes', () => {
    const result = slowWalk({
      data: hasNodesMockDataInArray,
      openNodes: [],
      searchTerm: '',
    });
    expect(result).toEqual(hasNodesExpectedOutcome);
  });
});

describe('fastWalk', () => {
  it('should transpose the data object to a desired shape', () => {
    const result = fastWalk({ data: mockDataInObject, openNodes: [], searchTerm: '7' });
    expect(result).toEqual(expectedOutcome);
  });
  it('should transpose the data array to a desired shape', () => {
    const result = fastWalk({ data: mockDataInArray, openNodes: [], searchTerm: '7' });
    expect(result).toEqual(expectedOutcome);
  });

  it('should transpose the data object with supplied hasNodes', () => {
    const result = fastWalk({
      data: hasNodesMockDataInObject,
      openNodes: [],
      searchTerm: '',
    });
    expect(result).toEqual(hasNodesExpectedOutcome);
  });
  it('should transpose the data array with supplied hasNodes', () => {
    const result = fastWalk({
      data: hasNodesMockDataInArray,
      openNodes: [],
      searchTerm: '',
    });
    expect(result).toEqual(hasNodesExpectedOutcome);
  });
});
