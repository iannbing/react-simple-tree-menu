import { shallow } from 'enzyme';

import { renderItem } from '../renderProps';

describe('renderItem', () => {
  it('should render without the toggle icon', () => {
    const wrapper = shallow(renderItem({ hasNodes: false, label: 'foo', key: 'key' }));

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children().length).toBe(1);
  });

  it('should render the toggle icon with "on" equals to true', () => {
    const wrapper = shallow(
      renderItem({ hasNodes: true, isOpen: true, level: 1, label: 'foo', key: 'key' })
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('ToggleIcon').prop('on')).toEqual(true);
    expect(wrapper.children().length).toBe(2);
  });
  it('should render the toggle icon with "on" equals to false', () => {
    const wrapper = shallow(
      renderItem({ hasNodes: true, isOpen: false, level: 1, label: 'foo', key: 'key' })
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('ToggleIcon').prop('on')).toEqual(false);
    expect(wrapper.children().length).toBe(2);
  });
  it('should render with level 3', () => {
    const wrapper = shallow(
      renderItem({ hasNodes: true, isOpen: false, level: 3, label: 'foo', key: 'key' })
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.childAt(0).prop('level')).toEqual(3);
  });
});
