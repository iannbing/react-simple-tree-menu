// Default render-prop function for v2. Emits a search input (when
// hasSearch) and the tree container with ARIA role="tree". SPEC §8 + §12.

import { useEffect, useState, type ChangeEvent } from 'react';
import { ItemComponent } from './item-component';
import type { TreeMenuChildren } from './types';

interface SearchBarProps {
  search: (term: string) => void;
  searchTerm: string | undefined;
}

// Internal component so we can hold local display state. `defaultChildren`
// itself is a plain render function per TreeMenuChildren's contract and
// cannot call hooks directly.
function SearchBar({ search, searchTerm }: SearchBarProps) {
  // Local display state so keystrokes render immediately, independent of
  // the debounced `searchTerm` commit cycle. When the parent clears
  // `searchTerm` (e.g. via `resetOpenNodes`), we mirror it here so the
  // input visibly empties — v1's search-field-doesn't-clear-on-reset bug.
  const [displayTerm, setDisplayTerm] = useState(searchTerm ?? '');
  useEffect(() => {
    setDisplayTerm(searchTerm ?? '');
  }, [searchTerm]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayTerm(value);
    search(value);
  };

  return (
    <input
      className="rstm-search"
      aria-label="Type and search"
      type="search"
      placeholder="Type and search"
      value={displayTerm}
      onChange={onChange}
    />
  );
}

export const defaultChildren: TreeMenuChildren = ({
  search,
  searchTerm,
  items,
}) => (
  <>
    {search && <SearchBar search={search} searchTerm={searchTerm} />}
    <ul className="rstm-tree-item-group" role="tree">
      {items.map(({ key, ...props }) => (
        <ItemComponent key={key} {...props} />
      ))}
    </ul>
  </>
);
