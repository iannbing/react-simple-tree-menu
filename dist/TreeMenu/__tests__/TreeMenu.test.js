import React from 'react';
import { shallow, mount } from 'enzyme';
import TreeMenu from '../index';
var mockData = {
    atd: {
        label: 'ATS Guide',
        key: 'ats',
        index: 1,
    },
    releasenotes: {
        label: 'Release Notes',
        key: 'releasenotes',
        index: 0,
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
describe('TreeMenu', function () {
    it('should render the level-1 nodes by default', function () {
        var wrapper = mount(React.createElement(TreeMenu, { data: mockData }));
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('li').length).toEqual(2);
    });
    it('should open specified nodes', function () {
        var wrapper = mount(React.createElement(TreeMenu, { data: mockData, openNodes: ['releasenotes', 'releasenotes/desktop-modeler'] }));
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('li').length).toEqual(4);
    });
    it('should highlight the active node', function () {
        var activeKey = 'releasenotes/desktop-modeler/7';
        var wrapper = mount(React.createElement(TreeMenu, { data: mockData, activeKey: activeKey, openNodes: ['releasenotes', 'releasenotes/desktop-modeler'] }));
        var highlightedElement = wrapper
            .findWhere(function (node) { return node.key() === activeKey; })
            .childAt(0)
            .get(0);
        expect(wrapper).toMatchSnapshot();
        expect(highlightedElement.props.className).toContain('rstm-tree-item--active');
    });
    it('should trigger onClickItem when a node is clicked', function () {
        var mockOnClickItem = jest.fn();
        var wrapper = shallow(React.createElement(TreeMenu, { data: mockData, onClickItem: mockOnClickItem }));
        var targetNode = wrapper.findWhere(function (node) { return node.key() === 'releasenotes'; });
        targetNode.simulate('click');
        expect(mockOnClickItem.mock.calls.length).toEqual(1);
        expect(mockOnClickItem).toHaveBeenCalledWith({
            hasNodes: true,
            index: 0,
            isOpen: false,
            key: 'releasenotes',
            label: 'Release Notes',
            level: 0,
            openNodes: [],
            parent: '',
            searchTerm: '',
        });
    });
});
//# sourceMappingURL=TreeMenu.test.js.map