import * as React from 'react';

const DEFAULT_PADDING = 1.25;
const LEVEL_SPACE = 1.25;
const ICON_SIZE = 1;
const ToggleIcon = ({ on }: { on: boolean }) => <div>{on ? '-' : '+'}</div>;

export type RenderList = (
  props: { search: Function; items: JSX.Element[] }
) => JSX.Element;

export const renderList: RenderList = ({ search, items }) => {
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    search(value);
  };
  return (
    <>
      <input
        style={{
          margin: '.5em',
          paddingLeft: '.4em',
        }}
        placeholder="Type and search"
        onChange={onSearch}
      />
      <ul
        style={{
          listStyleType: 'none',
          paddingLeft: 0,
        }}
      >
        {items}
      </ul>
    </>
  );
};

export type RenderItem = (
  props: {
    hasNodes?: boolean;
    isOpen?: boolean;
    level?: number;
    onClick?: (event: React.MouseEvent<HTMLLIElement>) => void;
    active?: boolean;
    key: string;
    label: string;
    [name: string]: any;
  }
) => JSX.Element;

export const renderItem: RenderItem = ({
  hasNodes = false,
  isOpen = false,
  level = 0,
  onClick,
  active,
  key,
  label = 'unknown',
}) => (
  <li
    style={{
      paddingLeft: `${DEFAULT_PADDING + ICON_SIZE + level * LEVEL_SPACE}rem`,
      cursor: 'pointer',
      color: active ? 'white' : '#333',
      background: active ? '#179ed3' : 'none',
    }}
    onClick={onClick}
    key={key}
  >
    {hasNodes && (
      <div
        style={{
          position: 'absolute',
          left: `${ICON_SIZE + level * LEVEL_SPACE}rem`,
          width: `${ICON_SIZE}rem`,
          height: `${ICON_SIZE}rem`,
        }}
      >
        <ToggleIcon on={isOpen} />
      </div>
    )}
    {label}
  </li>
);
