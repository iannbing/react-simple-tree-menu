// Default render-prop function for v2. Emits a search input (when
// hasSearch) and the tree container with ARIA role="tree". SPEC §8 + §12.
//
// Consumer-supplied `classNames` are **appended** to the `rstm-*` anchor
// classes. The anchors stay on the DOM regardless — they're inert strings
// when the default CSS isn't imported, which lets Tailwind (or similar)
// users skip the CSS import and style purely through the prop.

import { useEffect, useState, type ChangeEvent } from 'react';
import { ItemComponent, type ItemClassNames } from './item-component';
import type { TreeMenuChildren, TreeMenuClassNames } from './types';

const DEFAULT_SEARCH_PLACEHOLDER = 'Search';
const DEFAULT_SEARCH_ARIA_LABEL = 'Search';

function cx(...tokens: Array<string | false | null | undefined>): string {
  let out = '';
  for (const t of tokens) {
    if (!t) continue;
    out = out ? out + ' ' + t : t;
  }
  return out;
}

// Shallow-copy the subset ItemComponent cares about. Avoids accidentally
// passing `search` / `group` classes down.
const toItemClassNames = (
  cn: TreeMenuClassNames | undefined
): ItemClassNames | undefined =>
  cn &&
  (({ item, active, focused, toggleIcon, toggleIconSymbol }) => ({
    item,
    active,
    focused,
    toggleIcon,
    toggleIconSymbol,
  }))(cn);

interface SearchBarProps {
  search: (term: string) => void;
  searchTerm: string | undefined;
  className: string;
  placeholder: string;
  ariaLabel: string;
}

// Internal component so we can hold local display state. `defaultChildren`
// itself is a plain render function per TreeMenuChildren's contract and
// cannot call hooks directly.
function SearchBar({
  search,
  searchTerm,
  className,
  placeholder,
  ariaLabel,
}: SearchBarProps) {
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
      className={className}
      aria-label={ariaLabel}
      type="search"
      placeholder={placeholder}
      value={displayTerm}
      onChange={onChange}
    />
  );
}

export const defaultChildren: TreeMenuChildren = ({
  search,
  searchTerm,
  items,
  classNames,
  labels,
}) => {
  const itemClassNames = toItemClassNames(classNames);
  return (
    <>
      {search && (
        <SearchBar
          search={search}
          searchTerm={searchTerm}
          className={cx('rstm-search', classNames?.search)}
          placeholder={labels?.searchPlaceholder ?? DEFAULT_SEARCH_PLACEHOLDER}
          ariaLabel={labels?.searchAriaLabel ?? DEFAULT_SEARCH_ARIA_LABEL}
        />
      )}
      <ul
        className={cx('rstm-tree-item-group', classNames?.group)}
        role="tree"
      >
        {items.map(({ key, ...props }) => (
          <ItemComponent key={key} {...props} classNames={itemClassNames} />
        ))}
      </ul>
    </>
  );
};
