import React from 'react';
import { shallow } from 'enzyme';

import KeyDown from '../KeyDown';

describe('KeyDown', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <KeyDown
        up={() => {}}
        down={() => {}}
        left={() => {}}
        right={() => {}}
        enter={() => {}}
      >
        children
      </KeyDown>
    );

    expect(wrapper).toMatchSnapshot();
  });
  it('should trigger onKeyDown when a key is Pressed', () => {
    const mockOnKeyDown = jest.fn();
    const wrapper = shallow(
      <KeyDown
        up={() => {}}
        down={() => {}}
        left={() => {}}
        right={() => {}}
        enter={() => {}}
        onKeyDown={mockOnKeyDown}
      >
        children
      </KeyDown>
    );

    wrapper.find('div').simulate('keydown', { keyCode: 13 }); // simulate selection
    expect(mockOnKeyDown.mock.calls.length).toEqual(1);
  });
});
