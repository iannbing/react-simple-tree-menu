import React from 'react';
import { Item } from './walk';

const DEFAULT_PADDING = 0.75;
const LEVEL_SPACE = 1.75;
const ICON_SIZE = 2;
const ToggleIcon = ({ on }: { on: boolean }) => (
  <div
    role="img"
    aria-label="Toggle"
    style={{
      width: `${ICON_SIZE}rem`,
      height: `${ICON_SIZE}rem`,
      textAlign: 'center',
      lineHeight: `${ICON_SIZE}rem`,
    }}
  >
    {on ? '-' : '+'}
  </div>
);

export interface TreeMenuItem extends Item {
  active?: boolean;
  onClick: (event: React.MouseEvent<HTMLLIElement>) => void;
  toggleNode?: () => void;
}

export type TreeMenuChildren = (
  props: {
    search?: Function;
    items: TreeMenuItem[];
  }
) => JSX.Element;

type RenderItem = (props: TreeMenuItem) => JSX.Element;

const renderItem: RenderItem = ({
  hasNodes = false,
  isOpen = false,
  level = 0,
  onClick,
  toggleNode,
  active,
  focus,
  key,
  label = 'unknown',
}) => (
  <li
    style={{
      padding: ` .75rem  1rem  .75rem ${DEFAULT_PADDING +
        ICON_SIZE * (hasNodes ? 0 : 1) +
        level * LEVEL_SPACE}rem`,
      cursor: 'pointer',
      color: active ? 'white' : '#333',
      background: active ? '#179ed3' : 'none',
      borderBottom: active ? 'none' : '1px solid #ccc',
      boxShadow: focus ? '0px 0px 5px 0px #222' : 'none',
      zIndex: focus ? 999 : 'unset',
      position: 'relative',
    }}
    role="button"
    aria-pressed={active}
    key={key}
  >
    {hasNodes && (
      <div style={{ display: 'inline-block' }} onClick={toggleNode}>
        <ToggleIcon on={isOpen} />
      </div>
    )}
    <span onClick={onClick}>{label}</span>
  </li>
);

export const defaultChildren: TreeMenuChildren = ({ search, items }) => {
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    search && search(value);
  };
  return (
    <>
      {search && (
        <input
          style={{ padding: '1rem 1.5rem', border: 'none', width: '100%' }}
          aria-label="Type and search"
          type="search"
          placeholder="Type and search"
          onChange={onSearch}
        />
      )}
      <ul style={{ listStyleType: 'none', paddingLeft: 0, borderTop: '1px solid #ccc' }}>
        {items.map(renderItem)}
      </ul>
    </>
  );
};
