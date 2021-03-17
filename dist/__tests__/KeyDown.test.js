import React from 'react';
import { shallow } from 'enzyme';
import KeyDown from '../KeyDown';
describe('KeyDown', function () {
    it('should render correctly', function () {
        var wrapper = shallow(React.createElement(KeyDown, { up: function () { }, down: function () { }, left: function () { }, right: function () { }, enter: function () { } }, "children"));
        expect(wrapper).toMatchSnapshot();
    });
});
//# sourceMappingURL=KeyDown.test.js.map