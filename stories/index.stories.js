import React from 'react';

import { storiesOf } from '@storybook/react';
import { action, withActions } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { withInfo } from '@storybook/addon-info';

import { ListGroupItem, Input, ListGroup } from 'reactstrap';
import TreeMenu, { defaultChildren, ItemComponent } from '../src/index';
import closedIconImg from './assets/closedIcon.png';
import openedIconImg from './assets/openedIcon.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/sass/main.scss';

const DEFAULT_PADDING = 16;
const ICON_SIZE = 8;
const LEVEL_SPACE = 16;

// Icon example
const iconStyle = {
  verticalAlign: 'text-bottom',
};
const openedIcon = <img src={openedIconImg} alt="-" style={iconStyle}></img>;
const closedIcon = <img src={closedIconImg} alt="+" style={iconStyle}></img>;

const ToggleIcon = ({ on }) => <span style={{ marginRight: 8 }}>{on ? '-' : '+'}</span>;
const ListItem = ({
  level = 0,
  hasNodes,
  isOpen,
  label,
  searchTerm,
  openNodes,
  toggleNode,
  matchSearch,
  focused,
  ...props
}) => (
  <ListGroupItem
    {...props}
    style={{
      paddingLeft: DEFAULT_PADDING + ICON_SIZE + level * LEVEL_SPACE,
      cursor: 'pointer',
      boxShadow: focused ? '0px 0px 5px 0px #222' : 'none',
      zIndex: focused ? 999 : 'unset',
      position: 'relative',
    }}
  >
    {hasNodes && (
      <div
        style={{ display: 'inline-block' }}
        onClick={e => {
          hasNodes && toggleNode && toggleNode();
          e.stopPropagation();
        }}
      >
        <ToggleIcon on={isOpen} />
      </div>
    )}
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

const translations = {
  Mammal: 'Mamífero',
  Canidae: 'Canidae',
  Dog: 'Perro',
  Fox: 'Zorro',
  Wolf: 'Lobo',
  Reptile: 'Reptil',
  Squamata: 'Squamata',
  Lizard: 'Lagartija',
  Snake: 'Serpiente',
  Gekko: 'Gekko',
};

storiesOf('TreeMenu', module)
  .addDecorator(withInfo)
  .add('default usage', () => (
    <TreeMenu data={dataInArray} onClickItem={action(`on click node`)} />
  ))
  .add('without search', () => (
    <TreeMenu
      data={dataInArray}
      onClickItem={action(`on click node`)}
      hasSearch={false}
    />
  ))
  .add('has initial states', () => (
    <TreeMenu
      data={dataInArray}
      onClickItem={action(`on click node`)}
      initialOpenNodes={['reptile', 'reptile/squamata', 'reptile/squamata/lizard']}
      initialActiveKey="reptile/squamata"
    />
  ))
  .add('set initial state when data is updated', () => {
    class TreeMenuWrapper extends React.Component {
      state = { data: dataInArray };
      updateData = () =>
        this.setState(({ data }) => ({
          data: [
            ...data,
            {
              key: 'foo',
              label: 'Foo',
              url: 'https://www.google.com/search?q=foo',
            },
          ],
        }));
      render() {
        const { data } = this.state;
        return (
          <>
            <div style={{ padding: '12px', background: 'black' }}>
              <button style={{ margin: '4px' }} onClick={() => this.updateData()}>
                Add Foo
              </button>
            </div>
            <TreeMenu
              data={data}
              onClickItem={action(`on click node`)}
              initialOpenNodes={[
                'reptile',
                'reptile/squamata',
                'reptile/squamata/lizard',
              ]}
              initialActiveKey="reptile/squamata"
              resetOpenNodesOnDataUpdate
            />
          </>
        );
      }
    }
    return <TreeMenuWrapper />;
  })
  .add('control TreeMenu only from its parent', () => {
    class TreeMenuWrapper extends React.Component {
      state = { openNodes: [] };
      render() {
        return (
          <>
            <div style={{ padding: '12px', background: 'black' }}>
              <button
                style={{ margin: '4px' }}
                onClick={() =>
                  this.setState({ openNodes: ['reptile'], activeKey: 'reptile' })
                }
              >
                Open Reptile
              </button>
              <button
                style={{ margin: '4px' }}
                onClick={() =>
                  this.setState({ openNodes: ['mammal'], activeKey: 'mammal' })
                }
              >
                Open Mammal
              </button>
              <button
                style={{ margin: '4px' }}
                onClick={() =>
                  this.setState({
                    openNodes: ['mammal', 'mammal/canidae'],
                    activeKey: 'mammal/canidae/dog',
                  })
                }
              >
                Highlight Dog
              </button>
            </div>
            <TreeMenu
              data={dataInArray}
              activeKey={this.state.activeKey}
              onClickItem={action(`on click node`)}
              openNodes={this.state.openNodes}
            />
          </>
        );
      }
    }
    return <TreeMenuWrapper />;
  })
  .add('control TreeMenu from both its parent and openNodes', () => {
    class TreeMenuWrapper extends React.Component {
      state = { openNodes: [] };
      childRef = React.createRef();
      render() {
        return (
          <>
            <div style={{ padding: '12px', background: 'black' }}>
              <button
                style={{ margin: '4px' }}
                onClick={() =>
                    this.childRef.current.resetOpenNodes(['reptile'], 'reptile')
                }
              >
                Open Reptile from Ref
              </button>
              <button
                style={{ margin: '4px' }}
                onClick={() =>
                  this.childRef.current.resetOpenNodes(["mammal", "mammal/canidae"], 'mammal/canidae') 
                }
              >
                Open/Highlight Canidae
              </button>
              <button
                style={{ margin: '4px' }}
                onClick={() =>
                    this.childRef.current.resetOpenNodes(["reptile", "reptile/squamata", "reptile/squamata/lizard"], "reptile/squamata/lizard", "reptile/squamata")
                }
              >
                Open/Highlight Lizard, focus Squamata
              </button>
            </div>
            <TreeMenu
              data={dataInArray}
              onClickItem={action(`on click node`)}
              ref={this.childRef}  
            />
          </>
        );
      }
    }
    return <TreeMenuWrapper />;
  })
  .add('translate to Spanish', () => (
    <TreeMenu
      data={dataInArray}
      onClickItem={action(`on click node`)}
      locale={({ label }) => {
        console.log('label: ' + label);
        console.log(translations[label]);
        return translations[label];
      }}
    />
  ))
  .add('apply other UI framework, e.g. bootstrap', () => (
    <TreeMenu data={dataInArray} debounceTime={500} onClickItem={action(`on click node`)}>
      {({ search, items }) => (
        <>
          <Input onChange={e => search(e.target.value)} placeholder="Type and search" />
          <ListGroup>
            {items.map(({ reset, ...props }) => (
              <ListItem {...props} />
            ))}
          </ListGroup>
        </>
      )}
    </TreeMenu>
  ))
  .add('reset openNodes', () => {
    return (
      <TreeMenu
        data={dataInArray}
        debounceTime={125}
        onClickItem={action(`on click node`)}
      >
        {({ search, items, resetOpenNodes }) => (
          <>
            <button
              onClick={() => {
                resetOpenNodes(['reptile']);
              }}
            >
              Reset
            </button>
            {defaultChildren({ search, items })}
          </>
        )}
      </TreeMenu>
    );
  })
  .add('Opened/Closed Icon', () => (
    <TreeMenu data={dataInArray} onClickItem={action(`on click node`)}>
      {({ items }) => (
        <ul className="tree-item-group">
          {items.map(({ key, ...props }) => (
            <ItemComponent
              key={key}
              {...props}
              openedIcon={openedIcon}
              closedIcon={closedIcon}
            />
          ))}
        </ul>
      )}
    </TreeMenu>
  ));
