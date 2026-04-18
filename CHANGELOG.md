# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [SemVer](https://semver.org/).

## [2.0.0] — unreleased

Full ground-up rewrite. Public API preserved byte-for-byte modulo the
specific removals called out in **Breaking changes** — consumers who
aren't using `cacheSearch` and are already on React ≥ 16.14 upgrade
with a single `npm install` and no code changes.

### Breaking changes

- **React peer floor raised** from `>=16.6.3` to `>=16.14`.
  16.14 (Oct 2020) is the first version that exposes
  `react/jsx-runtime`, which the new bundler relies on. The 16.6–16.13
  slice is a narrow window of React history; any consumer on 16.14+,
  17, 18, or 19 is unaffected.
- **`cacheSearch` prop removed.** It was a leaky abstraction tied to
  `fast-memoize`'s stringified-arg cache, which silently returned
  stale results when `locale` or `matchSearch` changed. Internal
  memoization is now plain `useMemo` keyed on real dependencies —
  correct by default, no user-facing knob. Delete the prop from any
  call site.
- **Default `onClickItem`** is now a no-op. v1 defaulted to
  `console.log`, which was never intended as shipped behavior.
  Supply your own handler if you need click feedback.
- **Default search placeholder + aria-label** changed from
  `"Type and search"` to `"Search"`. Restore via
  `labels={{ searchPlaceholder: 'Type and search', searchAriaLabel: 'Type and search' }}`.
- **Default toggle glyphs** changed from `"+" / "-"` to Unicode
  triangles `"▸" / "▾"`. Restore via `openedIcon` / `closedIcon`
  props on `ItemComponent` in a custom render-prop.
- **Default active color** softened from `#179ed3` to indigo-500
  (`#6366f1`). Override `--rstm-active-bg` for the old hue.

None of the above changes the public `.d.ts` export shape for
symbols or props that remained.

### Added

- **WAI-ARIA tree pattern** on rendered DOM: `role="tree"` on the
  container, `role="treeitem"` on each item, plus `aria-expanded`,
  `aria-level`, `aria-selected`, `aria-setsize`, `aria-posinset`.
  Roving tabindex (focused item `tabIndex=0`, others `-1`).
- **`classNames` prop** (`TreeMenuClassNames` type). Per-slot
  strings appended to the `rstm-*` anchor classes — Tailwind /
  utility-class users can skip the default CSS import and style
  with their framework while the anchor classes remain as inert
  strings for backward-compat CSS overrides.
- **`labels` prop** (`TreeMenuLabels` type). i18n-friendly overrides
  for default UI copy: `searchPlaceholder`, `searchAriaLabel`.
- **`TreeMenuHandle` ref shape.** `useImperativeHandle` exposes
  `resetOpenNodes` for consumers who prefer refs to render-props
  (mirrors v1's class-component ref pattern).
- **Tailwind v4 theming out of the box.** Every color/typography
  CSS custom property resolves via a `var()` chain that prefers
  Tailwind v4's auto-exposed theme variables (`--color-primary`,
  `--font-sans`, `--color-gray-*`). Tailwind v4 users' brands flow
  through with zero config.
- **CSS subpath export.** Import styles via
  `react-simple-tree-menu/styles` (the legacy
  `react-simple-tree-menu/dist/main.css` path still resolves as
  an alias).
- **WAI-ARIA tree pattern** on rendered DOM: see above.
- **Zero-dep bundle.** `dependencies: {}`. The library ships no
  transitive npm packages — consumers install 0 packages beyond
  React itself.
- **Posinset / setsize** now present on every `Item` for consumers
  who want ARIA sibling coordinates in custom render-props.
- Modern default stylesheet: rounded corners, subtle hover, inset
  focus ring. All values themable via CSS custom properties.

### Removed (internals)

- `classnames` runtime dependency.
- `fast-memoize` runtime dependency.
- `is-empty` runtime dependency.
- `tiny-debounce` runtime dependency.

Consumers don't need to uninstall — these were transitive.

### Changed (internals)

- Class component → function component with `useReducer`
  + `useImperativeHandle`. Behavior preserved; tested under a
  dual-entry characterization suite during the strangulation
  window.
- Tree flattening (`walk`) rewritten for the closed-branch
  short-circuit: walking a 100k-node fully-collapsed tree runs in
  microseconds.
- `ItemComponent` is now `React.memo`-wrapped.

### Infrastructure

- ESM-first published package with proper `exports` field.
- Types ship alongside: `dist/index.d.ts`.
- CI: GitHub Actions matrix on Node 20 × React 16.14, 17, 18, 19.
- Test stack: Vitest + React Testing Library (replaces Jest + Enzyme).
- Build: tsup (replaces Rollup 1).
- Lint: ESLint 9 flat config.
- Bundle size: **2.55 KB** minified + brotli
  (enforced via `size-limit` in CI, 3 KB budget).

### Fixed

- Search input is now **controlled** internally — clearing
  `searchTerm` via `resetOpenNodes` visibly empties the input,
  fixing a v1 bug where reset left stale text in the box.
- Object-format `TreeNode`'s sort `index` no longer leaks onto
  emitted `Item` objects.
- `ItemComponent` no longer spreads arbitrary user props onto the
  rendered `<li>` as HTML attributes (React's `key` warning,
  invalid data-like attributes).

---

## [1.1.18] and earlier

See git history before commit `44c0de3`.
