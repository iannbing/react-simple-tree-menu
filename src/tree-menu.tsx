// v2 TreeMenu function component. Composes useTreeMenuState + walk +
// useDebouncedCallback + KeyDown + defaultChildren.
//
// Public API byte-identical to v1.1.18 modulo `cacheSearch` removal
// (per test-fixtures/api-v2-removals.json). SPEC §§4, 6, 7, 8, 9, 10.

import * as React from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { walk } from './tree/walk';
import { useTreeMenuState } from './tree/use-tree-menu-state';
import { useDebouncedCallback } from './tree/use-debounced-callback';
import { KeyDown } from './key-down';
import { defaultChildren } from './default-children';
import type {
  TreeNode,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
  Item,
  TreeMenuChildren,
  TreeMenuClassNames,
  TreeMenuItem,
  TreeMenuLabels,
} from './types';

export interface TreeMenuProps {
  data: { [name: string]: TreeNode } | TreeNodeInArray[];
  activeKey?: string;
  focusKey?: string;
  initialActiveKey?: string;
  initialFocusKey?: string;
  initialOpenNodes?: string[];
  openNodes?: string[];
  resetOpenNodesOnDataUpdate?: boolean;
  hasSearch?: boolean;
  onClickItem?: (props: Item) => void;
  debounceTime?: number;
  children?: TreeMenuChildren;
  /**
   * Custom label transformer. **Pass a stable reference** (defined outside
   * the render or wrapped in `useCallback`) — the internal walk memo keys
   * on identity, so inlining this re-walks the tree on every render.
   */
  locale?: LocaleFunction;
  /**
   * Custom search matcher. **Pass a stable reference** — same memoization
   * note as `locale`.
   */
  matchSearch?: MatchSearchFunction;
  disableKeyboard?: boolean;
  /**
   * Per-slot CSS class names to append alongside the default `rstm-*`
   * anchors. Use this to style the default UI with Tailwind (or any other
   * utility framework) without importing the library's CSS file — the
   * `rstm-*` anchors remain as inert strings and your utility classes
   * provide the styles.
   */
  classNames?: TreeMenuClassNames;
  /**
   * Human-readable copy for the default UI. Use for i18n or brand voice
   * without writing a custom `children` render-prop.
   */
  labels?: TreeMenuLabels;
}

// Imperative API for consumers who prefer refs over render-props for the
// reset handle. Mirrors the class-component pattern used in Story 6 of
// the legacy stories (resetOpenNodes on TreeMenu instance).
export interface TreeMenuHandle {
  resetOpenNodes: (
    newOpenNodes?: string[],
    activeKey?: string,
    focusKey?: string
  ) => void;
}

// Feature-detect React 18+'s useDeferredValue. On 16.14/17 this doesn't
// exist and we fall through to identity — the library behaves exactly as
// before. On 18/19, wrapping `state.searchTerm` with it lets React keep
// the input responsive while the (potentially expensive) tree re-walk
// happens at lower priority. Additive, opt-out-able via a consumer who
// pins an older React peer, never changes behavioral correctness.
type UseDeferredValue = <T>(value: T) => T;
const useDeferredValueSafe: UseDeferredValue =
  (React as unknown as { useDeferredValue?: UseDeferredValue })
    .useDeferredValue ?? (<T,>(v: T): T => v);

function defaultOnClickItem(_item: Item): void {
  // no-op; dev warning once per component instance is attached in the
  // component body on first non-user invocation.
}

export const TreeMenu = forwardRef<TreeMenuHandle, TreeMenuProps>(
  function TreeMenu(props, ref) {
    const {
      data,
      activeKey: controlledActive,
      focusKey: controlledFocus,
      initialActiveKey,
      initialFocusKey,
      initialOpenNodes,
      openNodes: controlledOpen,
      resetOpenNodesOnDataUpdate = false,
      hasSearch = true,
      onClickItem = defaultOnClickItem,
      classNames,
      labels,
      debounceTime = 125,
      children = defaultChildren,
      locale,
      matchSearch,
      disableKeyboard = false,
    } = props;

    const { state, dispatch } = useTreeMenuState({
      initialOpenNodes,
      initialActiveKey,
      initialFocusKey,
      openNodes: controlledOpen,
      activeKey: controlledActive,
      focusKey: controlledFocus,
    });

    // Feature-detected deferred value: on React 18+ this smooths typing
    // into the search box against large trees (input commits at normal
    // priority, walk re-runs at "transition" priority). On 16.14/17 it's
    // the identity function — same-frame updates as before.
    const deferredSearchTerm = useDeferredValueSafe(state.searchTerm);

    // Flatten the tree. The only source of truth for visible items.
    const rawItems = useMemo(
      () =>
        walk({
          data,
          openNodes: state.openNodes,
          searchTerm: deferredSearchTerm,
          locale,
          matchSearch,
        }),
      [data, state.openNodes, deferredSearchTerm, locale, matchSearch]
    );

    // resetOpenNodes — render-prop callback + imperative ref handle.
    const resetOpenNodes = useCallback(
      (newOpenNodes?: string[], activeKey?: string, focusKey?: string) => {
        dispatch({
          type: 'RESET',
          openNodes: newOpenNodes ?? initialOpenNodes,
          activeKey,
          focusKey,
        });
      },
      [dispatch, initialOpenNodes]
    );
    useImperativeHandle(
      ref,
      () => ({ resetOpenNodes }),
      [resetOpenNodes]
    );

    // resetOpenNodesOnDataUpdate — mirror legacy behavior when data
    // reference changes.
    const prevDataRef = useRef(data);
    useEffect(() => {
      if (prevDataRef.current !== data) {
        prevDataRef.current = data;
        if (resetOpenNodesOnDataUpdate && initialOpenNodes) {
          dispatch({ type: 'RESET', openNodes: initialOpenNodes });
        }
      }
    }, [data, resetOpenNodesOnDataUpdate, initialOpenNodes, dispatch]);

    // Debounced search callback handed to render-props.
    const search = useDebouncedCallback((value: string) => {
      dispatch({ type: 'SEARCH', term: value });
    }, debounceTime);

    // Stable wrappers for per-item onClick / toggleNode. Dispatch identity
    // is stable, so these stay shape-equal across renders for React.memo
    // purposes (full handler-identity stabilization is M5.3 work).
    const handleClick = useCallback(
      (item: Item) => {
        dispatch({ type: 'ACTIVATE', key: item.key });
        onClickItem(item);
      },
      [dispatch, onClickItem]
    );
    const handleToggle = useCallback(
      (key: string) => {
        dispatch({ type: 'TOGGLE', key });
      },
      [dispatch]
    );

    // Decorate raw Item[] with active/focused and handlers.
    // Conditional spread for `toggleNode` so we never assign `undefined`
    // to an optional-absent property (exactOptionalPropertyTypes).
    const items: TreeMenuItem[] = useMemo(
      () =>
        rawItems.map((item): TreeMenuItem => {
          const focused = item.key === state.focusKey;
          const active = item.key === state.activeKey;
          return {
            ...item,
            focused,
            active,
            onClick: () => handleClick(item),
            ...(item.hasNodes
              ? { toggleNode: () => handleToggle(item.key) }
              : {}),
          };
        }),
      [rawItems, state.focusKey, state.activeKey, handleClick, handleToggle]
    );

    // Keyboard handlers. Match the legacy model in SPEC §7.
    //
    // No useMemo here — `items` is a new array on every relevant state change
    // (new Item wrappers via the decoration useMemo above), so memoizing this
    // object was never effective. An honest plain literal. M5.3/M6.3 will
    // revisit identity stability if profiling justifies it.
    const focusIndex = items.findIndex(
      (i) => i.key === (state.focusKey || state.activeKey)
    );
    const parentKeyOf = (key: string): string => {
      const slash = key.lastIndexOf('/');
      return slash === -1 ? key : key.slice(0, slash);
    };
    const keyDownProps = {
      up: () => {
        if (focusIndex > 0) {
          dispatch({ type: 'FOCUS', key: items[focusIndex - 1]!.key });
        }
      },
      down: () => {
        if (focusIndex !== -1 && focusIndex < items.length - 1) {
          dispatch({ type: 'FOCUS', key: items[focusIndex + 1]!.key });
        } else if (focusIndex === -1 && items.length > 0) {
          dispatch({ type: 'FOCUS', key: items[0]!.key });
        }
      },
      left: () => {
        const item = items[focusIndex];
        if (!item) return;
        if (item.isOpen) {
          // Close the branch; focus stays on the same item.
          dispatch({ type: 'TOGGLE', key: item.key });
        } else {
          // Already closed (or leaf) — jump focus to parent. No-op on
          // roots since parentKeyOf returns the same key.
          dispatch({ type: 'FOCUS', key: parentKeyOf(item.key) });
        }
      },
      right: () => {
        // WAI-ARIA tree pattern for Right Arrow:
        //   - Closed branch: open it; focus stays.
        //   - Open branch:   move focus to the first child.
        //   - Leaf:          no-op.
        // walk() emits depth-first, so the first child of an open parent
        // at items[focusIndex] is always items[focusIndex + 1].
        const item = items[focusIndex];
        if (!item || !item.hasNodes) return;
        if (!item.isOpen) {
          dispatch({ type: 'TOGGLE', key: item.key });
          return;
        }
        const child = items[focusIndex + 1];
        if (child && child.level === item.level + 1) {
          dispatch({ type: 'FOCUS', key: child.key });
        }
      },
      enter: () => {
        const item = items[focusIndex];
        if (!item) return;
        dispatch({ type: 'ACTIVATE', key: item.key });
        onClickItem(item);
      },
    };

    const renderProps = hasSearch
      ? {
          search,
          searchTerm: state.searchTerm,
          items,
          resetOpenNodes,
          classNames,
          labels,
        }
      : { items, resetOpenNodes, classNames, labels };

    const rendered = children(renderProps);

    return disableKeyboard ? rendered : <KeyDown {...keyDownProps}>{rendered}</KeyDown>;
  }
);

export default TreeMenu;
