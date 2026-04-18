// Reducer hook owning the four-slot TreeMenu state — openNodes /
// searchTerm / activeKey / focusKey — with controlled/uncontrolled
// duality at the boundary. SPEC §4.

import { useCallback, useMemo, useReducer, useRef } from 'react';

export interface TreeMenuStateShape {
  openNodes: string[];
  searchTerm: string;
  activeKey: string;
  focusKey: string;
}

export type TreeMenuAction =
  | { type: 'TOGGLE'; key: string }
  | { type: 'SEARCH'; term: string }
  | { type: 'ACTIVATE'; key: string }
  | { type: 'FOCUS'; key: string }
  | {
      type: 'RESET';
      openNodes?: string[];
      activeKey?: string;
      focusKey?: string;
    };

export interface UseTreeMenuStateProps {
  initialOpenNodes?: string[];
  initialActiveKey?: string;
  initialFocusKey?: string;
  // Controlled overrides. When provided, internal state for that slot is
  // bypassed on read, and TOGGLE becomes a no-op.
  openNodes?: string[];
  activeKey?: string;
  focusKey?: string;
}

interface InternalState extends TreeMenuStateShape {
  // Snapshot of initialOpenNodes at mount; RESET reads from here.
  initialOpenNodes: string[];
}

function reducer(state: InternalState, action: TreeMenuAction): InternalState {
  switch (action.type) {
    case 'TOGGLE': {
      const idx = state.openNodes.indexOf(action.key);
      const openNodes =
        idx === -1
          ? [...state.openNodes, action.key]
          : state.openNodes.filter((k) => k !== action.key);
      return { ...state, openNodes };
    }
    case 'SEARCH':
      return { ...state, searchTerm: action.term };
    case 'ACTIVATE':
      return { ...state, activeKey: action.key, focusKey: action.key };
    case 'FOCUS':
      return { ...state, focusKey: action.key };
    case 'RESET':
      return {
        ...state,
        openNodes: action.openNodes ?? state.initialOpenNodes,
        activeKey: action.activeKey ?? '',
        focusKey: action.focusKey ?? action.activeKey ?? '',
        searchTerm: '',
      };
    default:
      return state;
  }
}

export interface UseTreeMenuStateReturn {
  state: TreeMenuStateShape;
  dispatch: (action: TreeMenuAction) => void;
}

export function useTreeMenuState(
  props: UseTreeMenuStateProps
): UseTreeMenuStateReturn {
  const {
    initialOpenNodes,
    initialActiveKey,
    initialFocusKey,
    openNodes: controlledOpen,
    activeKey: controlledActive,
    focusKey: controlledFocus,
  } = props;

  // useReducer initializer reads initial* once; subsequent changes to
  // initial* props do not re-seed state (matches legacy behavior).
  const [internal, rawDispatch] = useReducer(
    reducer,
    null,
    (): InternalState => ({
      openNodes: initialOpenNodes ?? [],
      searchTerm: '',
      activeKey: initialActiveKey ?? '',
      focusKey: initialFocusKey ?? '',
      initialOpenNodes: initialOpenNodes ?? [],
    })
  );

  // Merge controlled props on top of internal state.
  const state = useMemo<TreeMenuStateShape>(
    () => ({
      openNodes: controlledOpen ?? internal.openNodes,
      searchTerm: internal.searchTerm,
      activeKey: controlledActive ?? internal.activeKey,
      focusKey: controlledFocus ?? internal.focusKey,
    }),
    [
      controlledOpen,
      controlledActive,
      controlledFocus,
      internal.openNodes,
      internal.searchTerm,
      internal.activeKey,
      internal.focusKey,
    ]
  );

  // Stable dispatch. Reads `controlledOpen` through a ref so TOGGLE can
  // no-op while the dispatch's identity remains fixed across rerenders.
  const controlledOpenRef = useRef(controlledOpen);
  controlledOpenRef.current = controlledOpen;

  const dispatch = useCallback(
    (action: TreeMenuAction) => {
      if (action.type === 'TOGGLE' && controlledOpenRef.current !== undefined) {
        return;
      }
      rawDispatch(action);
    },
    [rawDispatch]
  );

  return { state, dispatch };
}
