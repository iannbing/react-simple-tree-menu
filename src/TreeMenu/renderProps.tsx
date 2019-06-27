import React from 'react';
import { Item } from './walk';

const DEFAULT_PADDING = 0.75;
const ICON_SIZE = 2;
const LEVEL_SPACE = 1.75;
const ToggleIcon = ({ on }: { on: boolean }) => (
  <div role="img" aria-label="Toggle" className="toggle-icon-symbol">
    {on ? '-' : '+'}
  </div>
);

export interface TreeMenuItem extends Item {
  active?: boolean;
  onClick: (event: React.MouseEvent<HTMLLIElement>) => void;
  toggleNode?: () => void;
}

export type TreeMenuChildren = (props: {
  search?: (term: string) => void;
  items: TreeMenuItem[];
  reset?: (openNodes?: string[]) => void;
}) => JSX.Element;

export const ItemComponent = ({
  hasNodes = false,
  isOpen = false,
  level = 0,
  onClick,
  toggleNode,
  active,
  focused,
  key,
  label = 'unknown',
  style = {},
}: TreeMenuItem) => (
  <li
    className="tree-item"
    style={{
      paddingLeft: `${DEFAULT_PADDING +
        ICON_SIZE * (hasNodes ? 0 : 1) +
        level * LEVEL_SPACE}rem`,
      ...style,
    }}
    role="button"
    aria-pressed={active}
    key={key}
    onClick={onClick}
  >
    {hasNodes && (
      <div
        className="toggle-icon"
        onClick={e => {
          hasNodes && toggleNode && toggleNode();
          e.stopPropagation();
        }}
      >
        <ToggleIcon on={isOpen} />
      </div>
    )}
    {label}
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
          className="search"
          aria-label="Type and search"
          type="search"
          placeholder="Type and search"
          onChange={onSearch}
        />
      )}
      <ul className="tree-item-group">
        {items.map(props => (
          <ItemComponent {...props}></ItemComponent>
        ))}
      </ul>
    </>
  );
};
