import { mount } from 'enzyme';

import { defaultChildren } from '../renderProps';

const search = () => console.log('search');

describe('defaultChildren', () => {
  it('should render without the toggle icon', () => {
    const wrapper = mount(
      defaultChildren({
        search,
        items: [
          {
            hasNodes: false,
            label: 'foo',
            key: 'key',
            onClick: () => {},
            level: 0,
            isOpen: false,
          },
        ],
      })
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('ToggleIcon').exists()).toEqual(false);
  });

  it('should render the toggle icon with "on" equals to true', () => {
    const wrapper = mount(
      defaultChildren({
        search,
        items: [
          {
            hasNodes: true,
            isOpen: true,
            level: 1,
            label: 'foo',
            key: 'foo',
            onClick: () => {},
          },
          {
            hasNodes: false,
            isOpen: false,
            level: 2,
            label: 'bar',
            key: 'bar',
            onClick: () => {},
          },
          {
            hasNodes: false,
            isOpen: false,
            level: 2,
            label: 'zoo',
            key: 'zoo',
            onClick: () => {},
          },
        ],
      })
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('ToggleIcon').prop('on')).toEqual(true);
  });
  it('should render the toggle icon with "on" equals to false', () => {
    const wrapper = mount(
      defaultChildren({
        search,
        items: [
          {
            hasNodes: true,
            isOpen: false,
            level: 1,
            label: 'foo',
            key: 'key',
            onClick: () => {},
          },
        ],
      })
    );

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('ToggleIcon').prop('on')).toEqual(false);
  });
});
