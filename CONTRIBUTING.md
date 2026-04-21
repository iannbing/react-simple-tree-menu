# Contributing

Thanks for taking the time to contribute. This doc covers the local dev setup, the conventions the project follows, and the workflow for shipping a change.

> **File name:** GitHub picks up `CONTRIBUTING.md` (with the `-ING`) to surface it on the repo sidebar and link it from issue/PR templates. If you see docs referring to `CONTRIBUTE.md`, they mean this file.

## Prerequisites

- Node 20+ (the package's `engines` field; CI runs Node 20 exclusively)
- npm (the lockfile is `package-lock.json` — stick with npm)

## Local setup

```bash
git clone https://github.com/iannbing/react-simple-tree-menu.git
cd react-simple-tree-menu
npm ci                      # library deps
npm --prefix docs ci        # docs-site deps (separate package.json)
```

## Scripts you'll actually use

All run from the repo root.

| Script                                | What it does                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                            | Run the full Vitest suite (characterization + forward + unit + API contract).                                                                           |
| `npm run test:watch`                  | Vitest in watch mode.                                                                                                                                   |
| `npm run test:bench`                  | The walk/render-cost benchmarks.                                                                                                                        |
| `npm run typecheck`                   | `tsc --noEmit` — strict, `exactOptionalPropertyTypes: true`.                                                                                            |
| `npm run lint`                        | ESLint 9 flat config.                                                                                                                                   |
| `npm run format` / `format:check`     | Prettier.                                                                                                                                               |
| `npm run build`                       | `tsup` (ESM + CJS + `.d.ts`) + PostCSS for the stylesheet.                                                                                              |
| `npm run check:api`                   | Diffs `dist/index.d.ts` against the v1 fixture; fails on any unlisted export/prop change. Runs after `npm run build`.                                   |
| `npm run check:size`                  | `size-limit`; budget is **3.5 KB** minified + brotli.                                                                                                   |
| `npm run storybook`                   | Local-only Storybook 8 on port 9001 (dev/QA; not deployed).                                                                                             |
| `npm run docs:dev`                    | Starlight docs site at http://localhost:4321/react-simple-tree-menu/. Hot-reloads on library source via a Vite alias — no `npm run build` needed first. |
| `npm run docs:build` / `docs:preview` | Production build + preview of the docs site.                                                                                                            |

## Branch + PR workflow

- **Long-lived branches:** `master` (stable, what npm ships from) and `development` (integration).
- **Feature branches:** `feat/<topic>`, `fix/<topic>`, `ci/<topic>`, etc. Branch off `development`.
- **PRs target `development`.** Maintainers promote `development` → `master` when ready for a release.
- Keep PRs focused. One topic, one reviewable diff.
- For non-trivial changes, open an issue first so we can agree on scope before you write code.

## Commit conventions

The log follows Conventional Commits with these types:

- `feat` — user-facing addition
- `fix` — bug fix
- `perf` — performance work without behavior change
- `refactor` — internal restructuring, no behavior change
- `test` — tests only
- `docs` — README / CHANGELOG / docs site / code comments
- `chore` — tooling, dependencies
- `ci` — GitHub Actions / workflow changes
- `style` — cosmetic (formatting, whitespace)

Optional scope in parens: `feat(api): …`, `fix(styles): …`, `docs(site): …`, `ci(docs): …`.

First line ≤ 72 chars. Body wraps at 72. Explain the _why_, not the _what_ — the diff shows what.

Don't append a `Co-Authored-By` trailer unless the commit genuinely has two humans on it.

## Test-driven discipline

The project was rewritten under strict TDD (see `SPEC.md` for the behavioral contract):

- **Characterization tests** (`src/__tests__/characterization.test.tsx`) encode the public behavior. They must stay green across every commit.
- **Forward tests** cover additive v2 behavior (ARIA, SSR, API contract).
- **Unit tests** sit next to each pure module (`src/tree/*.test.ts`).

If you're changing behavior, a characterization test should have to move or be added. If nothing in the test suite reacts to your change, that's a signal the change isn't covered — add a test before the implementation.

## Accessibility bar

The rendered DOM follows the WAI-ARIA tree pattern with roving tabindex. When touching rendering:

- Preserve `role="tree"` on the container and `role="treeitem"` on each item.
- Keep `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded`, `aria-selected` in sync with state.
- Every interactive element needs a visible `:focus-visible` indicator.
- Respect `prefers-reduced-motion` — new transitions/animations must inherit the global kill-switch in `docs/src/styles/docs.css` or declare their own `@media` guard.

## Bundle size + runtime deps

- Runtime `dependencies` must stay **empty** (`"dependencies": {}`). React is the only peer.
- The brotli-minified ESM bundle must stay under **3.5 KB** (`npm run check:size`).
- If a feature needs a new runtime dep, the PR has to make the case in the description.

## API contract

v2.0.0 committed to a public API contract. `scripts/check-api-contract.mjs` runs after each build and diffs `dist/index.d.ts` against `test-fixtures/api-v1.d.ts`.

- **Any new export or prop** needs an entry in `test-fixtures/api-v2-removals.json` under `addedExports` or `addedProps`. CI fails without it.
- **Any removal** needs an entry under `removedExports` or `removedProps`, with a reason.
- **No renames** without discussion — breaks consumer upgrade paths.

## Testing across React versions

CI runs the suite on Node 20 × React `16.14.0`, `17.0.2`, `18.3.1`, `19.0.0`. Locally you can only hit the React version in `devDependencies` (currently 18.3). If a PR touches React-API surfaces (hooks, rendering), let CI catch the matrix and react to the failures.

Two known caveats:

- React 16/17 use `@testing-library/react@^12` which doesn't export `renderHook`. The hook test files (`src/tree/use-*.test.ts`) include a local `renderHook` shim built on `render()` — portable across RTL versions. Preserve that pattern when adding new hook tests.
- React 19 + RTL v16 + fake timers + `userEvent.type` can deadlock. For debounce/search tests, use `fireEvent.change` instead of `user.type` (see `src/__tests__/render-props-contract.test.tsx` for the pattern).

## Releasing (maintainer-only)

- **RC** (release candidate): push to `release/v2`. `.github/workflows/release.yml` runs all gates, bumps the version via `npm-version-suffix` (`2.0.0` → `2.0.0-rc.N`), publishes to npm with the `next` dist-tag, and pushes the bump commit + tag.
- **Stable**: Actions → Release → Run workflow (manual `workflow_dispatch`) with the target version. Publishes without a tag (becomes `latest`).
- Requires the `NPM_TOKEN` repo secret (automation token with publish rights).

## Docs site

- Source lives under `docs/` — Astro Starlight + React islands.
- The docs site imports `react-simple-tree-menu` via a Vite alias that points at the local library source (not the published package). That's the hot-reload shortcut; the alias is in `docs/astro.config.mjs` if you need to see where the resolution happens.
- `docs.yml` publishes the built site to GitHub Pages on every push to `master` (path-filtered to `docs/**`, `src/**`, and the workflow file itself). The workflow also idempotently flips the Pages source to "workflow build" if it's still on the legacy branch source.

## Things NOT to do

- Don't introduce runtime dependencies.
- Don't commit `PLAN.md` or `SPEC.md` — they're author working documents, local-only.
- Don't skip hooks (`--no-verify`) or bypass signing without a reason.
- Don't force-push to `master` or `development`.
- Don't add `console.log` or leftover debug statements — ESLint catches some, not all.

## Questions / help

Open an issue with the `question` label, or comment on the PR you're working against. If you're proposing a larger refactor, sketch the intent in an issue before investing the implementation time — it's a lot cheaper to disagree about scope at the issue stage than at the PR stage.
