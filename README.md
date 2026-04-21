# react-simple-tree-menu

[![npm](https://img.shields.io/npm/v/react-simple-tree-menu.svg)](https://www.npmjs.com/package/react-simple-tree-menu)

A simple, data-driven, **zero-runtime-dependency** React tree menu with:

- Full keyboard navigation (WAI-ARIA tree pattern)
- Built-in search with debouncing
- Works with any styling stack — import our CSS, skip it and use Tailwind utilities via a `classNames` prop, or swap in render-props for full control
- React 16.14+ (hooks), 17, 18, 19 — all tested in CI
- < 3 KB gzipped

## Install

```bash
npm install react-simple-tree-menu
```

```tsx
import TreeMenu from 'react-simple-tree-menu';
import 'react-simple-tree-menu/styles'; // optional, see "Styling" below
```

## Quickstart

```tsx
import TreeMenu from 'react-simple-tree-menu';
import 'react-simple-tree-menu/styles';

const data = [
  {
    key: 'fruits',
    label: 'Fruits',
    nodes: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
    ],
  },
  { key: 'vegetables', label: 'Vegetables' },
];

export function Example() {
  return (
    <TreeMenu
      data={data}
      onClickItem={({ key, label }) => console.log('clicked', key, label)}
    />
  );
}
```

## Data formats

Two equivalent shapes — pick whichever fits your source data:

**Array of nodes** (order matters, unique `key` per sibling):

```ts
const data = [
  { key: 'a', label: 'A', nodes: [{ key: 'a1', label: 'A1' }] },
  { key: 'b', label: 'B' },
];
```

**Object of nodes** (sorted by numeric `index`):

```ts
const data = {
  a: { label: 'A', index: 0, nodes: { a1: { label: 'A1', index: 0 } } },
  b: { label: 'B', index: 1 },
};
```

Arbitrary custom fields (e.g. `url`, `icon`) flow through each node and show up on the `Item` passed to `onClickItem`.

## Keyboard

Focus the tree (Tab), then:

| Key   | Action                                                 |
| ----- | ------------------------------------------------------ |
| ↑ / ↓ | Move focus to previous / next visible item             |
| ←     | Close the focused branch (or move focus to its parent) |
| →     | Open a closed branch · on an open branch, focus its first child |
| Enter | Activate focused item and fire `onClickItem`           |

## Styling

Three paths — pick the one that matches your stack:

### 1. Use the default stylesheet

```tsx
import 'react-simple-tree-menu/styles';
```

Ships a compact CSS file (~2.5 KB) with sans-serif fonts, subtle hover, inset focus ring, and indigo active state. Every color, radius, and spacing value is a CSS custom property — defaults are on `:root` with zero specificity, so you override globally, per-theme, or per-panel and the change inherits into every tree inside:

```css
/* global */
:root {
  --rstm-active-bg: #f97316;          /* orange */
  --rstm-radius: 0;                   /* square corners */
  --rstm-transition: 120ms ease-out;  /* opt into motion */
}

/* per-theme (light / dark attribute) */
:root[data-theme='dark'] {
  --rstm-text-color: #f3f4f6;
  --rstm-hover-bg: #1f2937;
}

/* per-panel (one tree themed differently from the rest) */
.my-dark-panel {
  --rstm-active-bg: #60a5fa;
}
```

The complete list of `--rstm-*` tokens and their default values lives in [`src/styles.css`](./src/styles.css). A docs-site guide with live previews is on the roadmap.

### 2. Tailwind v4 — brand-aligned with zero config

Tailwind v4 auto-exposes theme colors as CSS variables (`--color-primary`, `--color-gray-300`, …). The library's default stylesheet reads them via `var()` chains, so:

```tsx
import 'react-simple-tree-menu/styles'; // that's it
```

Active state tracks your `--color-primary`, borders track your `--color-gray-300`, body font tracks your `--font-sans`. Fallback palette kicks in where your theme is silent.

### 3. Headless with Tailwind utilities (no CSS import)

Pass utility classes via the `classNames` prop:

```tsx
<TreeMenu
  data={data}
  classNames={{
    item: 'py-3 px-4 cursor-pointer',
    active: 'bg-indigo-600 text-white',
    focused: 'ring-2 ring-offset-2 ring-indigo-500',
    search: 'py-2 px-3 w-full border rounded',
  }}
/>
```

The library's `rstm-*` anchor classes stay in the DOM (inert strings when the CSS isn't imported), so backward-compat CSS overrides keep working.

## API

### `<TreeMenu>` props

| Prop                         | Type                                  | Default                    | Description                                             |
| ---------------------------- | ------------------------------------- | -------------------------- | ------------------------------------------------------- |
| `data`                       | `TreeNode[]` \| `{ [key]: TreeNode }` | —                          | The tree, in either format above.                       |
| `activeKey`                  | `string`                              | —                          | Controlled selected-item key (full path).               |
| `focusKey`                   | `string`                              | —                          | Controlled keyboard-focused key.                        |
| `openNodes`                  | `string[]`                            | —                          | Controlled set of expanded branch keys.                 |
| `initialActiveKey`           | `string`                              | `''`                       | Uncontrolled initial selection.                         |
| `initialFocusKey`            | `string`                              | `''`                       | Uncontrolled initial focus.                             |
| `initialOpenNodes`           | `string[]`                            | `[]`                       | Uncontrolled initial open branches.                     |
| `resetOpenNodesOnDataUpdate` | `boolean`                             | `false`                    | Reset `openNodes` to initial when `data` ref changes.   |
| `hasSearch`                  | `boolean`                             | `true`                     | Render the default search input.                        |
| `onClickItem`                | `(item) => void`                      | no-op                      | Called on click and on Enter. Receives the full `Item`. |
| `debounceTime`               | `number`                              | `125`                      | Search-input debounce in ms.                            |
| `locale`                     | `(props) => string`                   | identity                   | Transform labels. **Pass a stable ref.**                |
| `matchSearch`                | `(props) => boolean`                  | case-insensitive substring | Custom matcher. **Pass a stable ref.**                  |
| `disableKeyboard`            | `boolean`                             | `false`                    | Skip the keyboard wrapper.                              |
| `children`                   | render-prop                           | default UI                 | Custom renderer — see below.                            |
| `classNames`                 | `TreeMenuClassNames`                  | —                          | Per-slot class names appended to `rstm-*` anchors.      |
| `labels`                     | `TreeMenuLabels`                      | English defaults           | i18n overrides for default-UI copy.                     |
| `keySeparator`               | `string`                              | `'/'`                      | Delimiter joining node keys into paths. Change if your keys contain `/` (URLs, paths). |

### Imperative ref

```tsx
const treeRef = useRef<TreeMenuHandle>(null);
<TreeMenu ref={treeRef} data={data} />;

treeRef.current?.resetOpenNodes(['fruits'], 'fruits/apple');
treeRef.current?.expandAll();   // every branch opens
treeRef.current?.collapseAll(); // back to roots only
```

`expandAll` / `collapseAll` preserve the user's current active / focus / search state. Both are no-ops when `openNodes` is controlled — the parent owns that slot. For controlled consumers, use the exported helper instead:

```tsx
import TreeMenu, { collectBranchKeys } from 'react-simple-tree-menu';

const [open, setOpen] = useState<string[]>([]);
<button onClick={() => setOpen(collectBranchKeys(data))}>Expand all</button>
<button onClick={() => setOpen([])}>Collapse all</button>
<TreeMenu data={data} openNodes={open} />
```

**Perf note:** `collectBranchKeys` is O(N) — microseconds even on 100k-node trees. The cost after expand-all comes from rendering every branch's children. For trees that grow beyond ~2k visible rows, pair with the [virtualization recipe](https://iannbing.github.io/react-simple-tree-menu/guides/virtualization/).

### Custom render-props

The `items` array is **always flat** — one entry per visible node in
depth-first order, with a `level` field for depth. How you render it is
up to you:

**Flat**: one `<ul>`, `paddingLeft: level * N` for indent. Simplest.

```tsx
<TreeMenu data={data}>
  {({ search, items, resetOpenNodes }) => (
    <div>
      <input onChange={(e) => search?.(e.target.value)} />
      <ul>
        {items.map(({ key, label, level, active, onClick }) => (
          <li
            key={key}
            aria-level={level + 1}
            aria-selected={!!active}
            style={{ paddingLeft: 8 + level * 16 }}
            className={active ? 'bg-indigo-500 text-white' : ''}
            onClick={onClick}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  )}
</TreeMenu>
```

**Nested `<ul>`/`<li>`/`<ul>`**: reconstruct hierarchy from each item's
slash-joined `key`. Matches the WAI-ARIA tree pattern's preferred DOM
shape (children inside `role="group"`). The library exports `unflatten`
— the same helper `defaultChildren` uses internally — so you don't have
to reimplement the grouping:

```tsx
import TreeMenu, { unflatten } from 'react-simple-tree-menu';

<TreeMenu data={data}>
  {({ items }) => {
    const { roots, childrenByParent } = unflatten(items);
    const renderNode = (it) => (
      <li key={it.key} role="treeitem" aria-level={it.level + 1}>
        <div onClick={it.onClick}>{it.label}</div>
        {childrenByParent.get(it.key) && (
          <ul role="group">
            {childrenByParent.get(it.key)!.map(renderNode)}
          </ul>
        )}
      </li>
    );
    return <ul role="tree">{roots.map(renderNode)}</ul>;
  }}
</TreeMenu>
```

See the
[render-props guide](https://iannbing.github.io/react-simple-tree-menu/guides/render-props/)
for the full recipe and a11y notes, or the Storybook **TreeMenu / Render-props** stories for runnable versions of both.

If you don't need custom rendering, the default `defaultChildren` already
emits the canonical nested DOM with full ARIA attributes and keyboard
support — prefer it unless you need to swap the outer layout.

## Migrating from v1.1.x

- **React peer floor:** raised from `>=16.6.3` to `>=16.14`. Anyone on React 16.14+, 17, 18, 19 is already good.
- **Removed prop:** `cacheSearch` — internal memoization now keyed on `useMemo` dependencies; no user-facing knob. Delete the prop from any call site.
- **CSS import path:** use `react-simple-tree-menu/styles`. The v1 `react-simple-tree-menu/dist/main.css` deep-import no longer resolves — swap it for the subpath export (same byte content).
- **Default search copy:** `"Type and search"` → `"Search"`. Pass `labels={{ searchPlaceholder: 'Type and search' }}` to restore.
- **Toggle glyph:** `"+" / "-"` → `"▸" / "▾"`. Pass `openedIcon`/`closedIcon` to `ItemComponent` (via custom render-props) to restore.
- **Default active color:** saturated blue → indigo. Override `--rstm-active-bg` for the old look.

Class-component v1 ref patterns keep working via the new `TreeMenuHandle` — `resetOpenNodes` is still callable through a ref.

## TypeScript

All types are published alongside the JS. Exported:

```ts
// Types
(TreeMenuProps,
  TreeMenuHandle,
  TreeMenuItem,
  TreeMenuChildren,
  TreeMenuClassNames,
  TreeMenuLabels,
  TreeNode,
  TreeNodeObject,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
  Item,
  UnflattenResult);

// Values
(ItemComponent, defaultChildren, KeyDown, unflatten);
```

## License

MIT — see [LICENSE](./LICENSE).
