import { mount } from 'enzyme';
import { defaultChildren } from '../renderProps';
var search = function (term) {
    console.log("search " + term);
};
describe('defaultChildren', function () {
    it('should render without the toggle icon', function () {
        var wrapper = mount(defaultChildren({
            search: search,
            items: [
                {
                    hasNodes: false,
                    label: 'foo',
                    key: 'key',
                    onClick: function () { },
                    level: 0,
                    isOpen: false,
                },
            ],
        }));
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ToggleIcon').exists()).toEqual(false);
    });
    it('should render the toggle icon with "on" equals to true', function () {
        var wrapper = mount(defaultChildren({
            search: search,
            items: [
                {
                    hasNodes: true,
                    isOpen: true,
                    level: 1,
                    label: 'foo',
                    key: 'foo',
                    onClick: function () { },
                },
                {
                    hasNodes: false,
                    isOpen: false,
                    level: 2,
                    label: 'bar',
                    key: 'bar',
                    onClick: function () { },
                },
                {
                    hasNodes: false,
                    isOpen: false,
                    level: 2,
                    label: 'zoo',
                    key: 'zoo',
                    onClick: function () { },
                },
            ],
        }));
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ToggleIcon').prop('on')).toEqual(true);
    });
    it('should render the toggle icon with "on" equals to false', function () {
        var wrapper = mount(defaultChildren({
            search: search,
            items: [
                {
                    hasNodes: true,
                    isOpen: false,
                    level: 1,
                    label: 'foo',
                    key: 'key',
                    onClick: function () { },
                },
            ],
        }));
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ToggleIcon').prop('on')).toEqual(false);
    });
});
//# sourceMappingURL=renderProps.test.js.map