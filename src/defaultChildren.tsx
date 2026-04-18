// Default render-prop function for v2. Emits a search input (when
// hasSearch) and the tree container with ARIA role="tree". SPEC §8 + §12.

import type { ChangeEvent } from 'react';
import { ItemComponent } from './ItemComponent';
import type { TreeMenuChildren } from './types';

export const defaultChildren: TreeMenuChildren = ({ search, items }) => {
  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (search) search(e.target.value);
  };
  return (
    <>
      {search && (
        <input
          className="rstm-search"
          aria-label="Type and search"
          type="search"
          placeholder="Type and search"
          onChange={onSearch}
        />
      )}
      <ul className="rstm-tree-item-group" role="tree">
        {items.map(({ key, ...props }) => (
          <ItemComponent key={key} {...props} />
        ))}
      </ul>
    </>
  );
};
