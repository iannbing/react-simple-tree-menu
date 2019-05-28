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
});
