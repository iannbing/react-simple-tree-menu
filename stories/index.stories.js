import React from 'react';

import { storiesOf } from '@storybook/react';
import { action, withActions } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { withInfo } from '@storybook/addon-info';

import { ListGroupItem, Input, ListGroup } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TreeMenu from '../src/index';

const DEFAULT_PADDING = 16;
const ICON_SIZE = 8;
const LEVEL_SPACE = 16;

const ToggleIcon = ({ on }) => <span style={{ marginRight: 8 }}>{on ? '-' : '+'}</span>;
const ListItem = ({ level = 0, hasNodes, isOpen, label, ...props }) => (
  <ListGroupItem
    {...props}
    style={{
      paddingLeft: DEFAULT_PADDING + ICON_SIZE + level * LEVEL_SPACE,
      cursor: 'pointer',
    }}
  >
    {hasNodes && <ToggleIcon on={isOpen} />}
    {label}
  </ListGroupItem>
);

const dataInArray = [
  {
    key: 'mammal',
    label: 'Mammal',
    url: 'https://www.google.com/search?q=mammal',
    nodes: [
      {
        key: 'canidae',
        label: 'Canidae',
        url: 'https://www.google.com/search?q=canidae',
        nodes: [
          {
            key: 'dog',
            label: 'Dog',
            url: 'https://www.google.com/search?q=dog',
            nodes: [],
          },
          {
            key: 'fox',
            label: 'Fox',
            url: 'https://www.google.com/search?q=fox',
            nodes: [],
          },
          {
            key: 'wolf',
            label: 'Wolf',
            url: 'https://www.google.com/search?q=wolf',
            nodes: [],
          },
        ],
      },
    ],
  },
  {
    key: 'reptile',
    label: 'Reptile',
    url: 'https://www.google.com/search?q=reptile',
    nodes: [
      {
        key: 'squamata',
        label: 'Squamata',
        url: 'https://www.google.com/search?q=squamata',
        nodes: [
          {
            key: 'lizard',
            label: 'Lizard',
            url: 'https://www.google.com/search?q=lizard',
          },
          {
            key: 'snake',
            label: 'Snake',
            url: 'https://www.google.com/search?q=snake',
          },
          {
            key: 'gekko',
            label: 'Gekko',
            url: 'https://www.google.com/search?q=gekko',
          },
        ],
      },
    ],
  },
];

storiesOf('TreeMenu', module)
  .addDecorator(withInfo)
  .add('default usage', () => (
    <TreeMenu data={dataInArray} onClickItem={action(`on click node`)} />
  ))
  .add('apply bootstrap', () => (
    <TreeMenu data={dataInArray} debounceTime={125} onClickItem={action(`on click node`)}>
      {({ search, items }) => (
        <>
          <Input onChange={e => search(e.target.value)} placeholder="Type and search" />
          <ListGroup>
            {items.map(props => (
              <ListItem {...props} />
            ))}
          </ListGroup>
        </>
      )}
    </TreeMenu>
  ));
