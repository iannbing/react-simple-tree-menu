import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeMenu, {
  ItemComponent,
  defaultChildren,
  KeyDown,
  type TreeMenuProps,
  type TreeMenuItem,
  type TreeMenuChildren,
  type TreeNode,
  type TreeNodeObject,
  type TreeNodeInArray,
  type LocaleFunction,
  type MatchSearchFunction,
  type Item,
} from '../index';

describe('smoke: public entry re-exports', () => {
  it('exports TreeMenu as default', () => {
    expect(TreeMenu).toBeDefined();
  });

  it('exports ItemComponent, defaultChildren, KeyDown as named', () => {
    expect(ItemComponent).toBeDefined();
    expect(defaultChildren).toBeDefined();
    expect(KeyDown).toBeDefined();
  });

  it('type exports are reachable at compile time', () => {
    const _p: TreeMenuProps = { data: [] };
    const _i: TreeMenuItem = {
      key: 'x',
      label: 'x',
      hasNodes: false,
      isOpen: false,
      level: 0,
      onClick: () => {},
    };
    const _c: TreeMenuChildren = ({ items }) => <>{items.length}</>;
    const _tn: TreeNode = { label: 'x', index: 0 };
    const _tno: TreeNodeObject = { x: { label: 'x', index: 0 } };
    const _tnia: TreeNodeInArray = { key: 'x', label: 'x' };
    const _lf: LocaleFunction = ({ label }) => label;
    const _ms: MatchSearchFunction = ({ label, searchTerm }) =>
      label.includes(searchTerm);
    const _it: Item = { hasNodes: false, isOpen: false, level: 0, key: 'x', label: 'x' };
    expect([_p, _i, _c, _tn, _tno, _tnia, _lf, _ms, _it]).toHaveLength(9);
  });
});

describe('smoke: minimal render against legacy', () => {
  it('renders with array data', () => {
    const data: TreeNodeInArray[] = [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta', nodes: [{ key: 'b1', label: 'Beta one' }] },
    ];
    render(<TreeMenu data={data} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders with object data sorted by index', () => {
    const data = {
      z: { label: 'Zebra', index: 1 },
      a: { label: 'Ant', index: 0 },
    };
    render(<TreeMenu data={data} />);
    const items = screen.getAllByRole('button');
    expect(items[0]).toHaveTextContent('Ant');
    expect(items[1]).toHaveTextContent('Zebra');
  });
});
