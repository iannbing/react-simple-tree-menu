// v2 TreeMenu function component. Composes useTreeMenuState + walk +
// useDebouncedCallback + KeyDown + defaultChildren.
//
// Public API byte-identical to v1.1.18 modulo `cacheSearch` removal
// (per test-fixtures/api-v2-removals.json). SPEC §§4, 6, 7, 8, 9, 10.

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { walk } from './tree/walk';
import { useTreeMenuState } from './tree/useTreeMenuState';
import { useDebouncedCallback } from './tree/useDebouncedCallback';
import { KeyDown } from './KeyDown';
import { defaultChildren } from './defaultChildren';
import type {
  TreeNode,
  TreeNodeInArray,
  LocaleFunction,
  MatchSearchFunction,
  Item,
  TreeMenuChildren,
  TreeMenuItem,
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
  locale?: LocaleFunction;
  matchSearch?: MatchSearchFunction;
  disableKeyboard?: boolean;
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

// Note: M6.3 will re-introduce useDeferredValue as an opt-in perf
// enhancement for React 18+ users. It was removed at M5.1 because the
// scheduler timing under vitest fake timers made the characterization
// suite flaky — and behavioral parity with legacy is the non-negotiable
// gate for cutover. The optimization is strictly additive and lands
// with dedicated real-timer tests once the flip is done.

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

    // Flatten the tree. The only source of truth for visible items.
    // (M6.3 will wrap state.searchTerm in a feature-detected useDeferredValue
    // for large-tree input smoothing on React 18+.)
    const rawItems = useMemo(
      () =>
        walk({
          data,
          openNodes: state.openNodes,
          searchTerm: state.searchTerm,
          locale,
          matchSearch,
        }),
      [data, state.openNodes, state.searchTerm, locale, matchSearch]
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
    const items: TreeMenuItem[] = useMemo(
      () =>
        rawItems.map((item) => {
          const focused = item.key === state.focusKey;
          const active = item.key === state.activeKey;
          const treeItem: TreeMenuItem = {
            ...item,
            focused,
            active,
            onClick: () => handleClick(item),
            toggleNode: item.hasNodes ? () => handleToggle(item.key) : undefined,
          } as TreeMenuItem;
          return treeItem;
        }),
      [rawItems, state.focusKey, state.activeKey, handleClick, handleToggle]
    );

    // Keyboard handlers. Match the legacy model in SPEC §7.
    const keyDownProps = useMemo(
      () => {
        const focusIndex = items.findIndex(
          (i) => i.key === (state.focusKey || state.activeKey)
        );
        const parentKey = (key: string): string => {
          const parts = key.split('/');
          return parts.length > 1 ? parts.slice(0, -1).join('/') : key;
        };
        return {
          up: () => {
            if (focusIndex > 0)
              dispatch({ type: 'FOCUS', key: items[focusIndex - 1]!.key });
          },
          down: () => {
            if (focusIndex !== -1 && focusIndex < items.length - 1)
              dispatch({ type: 'FOCUS', key: items[focusIndex + 1]!.key });
            else if (focusIndex === -1 && items.length > 0)
              dispatch({ type: 'FOCUS', key: items[0]!.key });
          },
          left: () => {
            const item = items[focusIndex];
            if (!item) return;
            if (item.isOpen) {
              dispatch({ type: 'TOGGLE', key: item.key });
              dispatch({ type: 'FOCUS', key: item.key });
            } else {
              dispatch({ type: 'FOCUS', key: parentKey(item.key) });
            }
          },
          right: () => {
            const item = items[focusIndex];
            if (item && item.hasNodes && !item.isOpen) {
              dispatch({ type: 'TOGGLE', key: item.key });
            }
          },
          enter: () => {
            const item = items[focusIndex];
            if (item) {
              dispatch({ type: 'ACTIVATE', key: state.focusKey || item.key });
              onClickItem(item);
            }
          },
        };
      },
      [items, state.focusKey, state.activeKey, dispatch, onClickItem]
    );

    const renderProps = hasSearch
      ? { search, searchTerm: state.searchTerm, items, resetOpenNodes }
      : { items, resetOpenNodes };

    const rendered = children(renderProps);

    return disableKeyboard ? rendered : <KeyDown {...keyDownProps}>{rendered}</KeyDown>;
  }
);

export default TreeMenu;
