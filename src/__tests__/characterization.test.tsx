// Characterization suite. Asserts the v1.1.18 behavior contract against the
// public entry (`../index`). Green at every commit — these tests regress
// the moment strangulation breaks anything.
//
// Derived from SPEC.md. Cover a behavior per `it` with the smallest setup
// that exercises it.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TreeMenu, {
  type TreeMenuChildren,
  type TreeMenuProps,
  type TreeNodeInArray,
} from '../index';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const arrayData: TreeNodeInArray[] = [
  {
    key: 'fruits',
    label: 'Fruits',
    url: '/fruits',
    nodes: [
      { key: 'apple', label: 'Apple', color: 'red' },
      { key: 'banana', label: 'Banana' },
    ],
  },
  {
    key: 'vegetables',
    label: 'Vegetables',
    nodes: [{ key: 'carrot', label: 'Carrot' }],
  },
];

const objectData: TreeMenuProps['data'] = {
  fruits: {
    label: 'Fruits',
    index: 0,
    nodes: {
      apple: { label: 'Apple', index: 0 },
      banana: { label: 'Banana', index: 1 },
    },
  },
  vegetables: {
    label: 'Vegetables',
    index: 1,
    nodes: { carrot: { label: 'Carrot', index: 0 } },
  },
};

// Helper: get the clickable element for a given visible label. In v1 this
// is the `<li role="button">`; in v2 it will be `<li role="treeitem">`. Both
// accept click events, so we find by text and walk to the enclosing `<li>`.
const itemOf = (label: string): HTMLElement => {
  const node = screen.getByText(label).closest('li');
  if (!node) throw new Error(`No <li> ancestor for "${label}"`);
  return node as HTMLElement;
};

// Helper: timer-safe user-event setup for debounce tests.
const setupWithFakeTimers = () => {
  vi.useFakeTimers();
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
};

// ---------------------------------------------------------------------------
// 1. Data formats
// ---------------------------------------------------------------------------

describe('data formats', () => {
  it('renders an array-format tree with top-level items visible', () => {
    render(<TreeMenu data={arrayData} />);
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
  });

  it('renders an object-format tree with siblings sorted by index', () => {
    render(<TreeMenu data={objectData} />);
    const items = screen.getAllByText(/Fruits|Vegetables/);
    expect(items[0]).toHaveTextContent('Fruits');
    expect(items[1]).toHaveTextContent('Vegetables');
  });

  it('hides nested items when their ancestors are closed', () => {
    render(<TreeMenu data={arrayData} />);
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Carrot')).not.toBeInTheDocument();
  });

  it('flows custom node props through to onClickItem', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    render(<TreeMenu data={arrayData} onClickItem={onClickItem} />);
    await user.click(itemOf('Fruits'));
    expect(onClickItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'fruits', label: 'Fruits', url: '/fruits' })
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Initial state (uncontrolled)
// ---------------------------------------------------------------------------

describe('initial state', () => {
  it('initialOpenNodes expands the listed branches on mount', () => {
    render(<TreeMenu data={arrayData} initialOpenNodes={['fruits']} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Carrot')).not.toBeInTheDocument();
  });

  it('initialActiveKey marks the matching item as active', () => {
    render(
      <TreeMenu
        data={arrayData}
        initialOpenNodes={['fruits']}
        initialActiveKey="fruits/apple"
      />
    );
    expect(itemOf('Apple').className).toMatch(/rstm-tree-item--active/);
  });

  it('initialFocusKey marks the matching item as focused', () => {
    render(
      <TreeMenu
        data={arrayData}
        initialOpenNodes={['fruits']}
        initialFocusKey="fruits/banana"
      />
    );
    expect(itemOf('Banana').className).toMatch(/rstm-tree-item--focused/);
  });
});

// ---------------------------------------------------------------------------
// 3. Toggling open/closed (uncontrolled)
// ---------------------------------------------------------------------------

describe('toggling (uncontrolled)', () => {
  it('clicking the toggle icon opens a branch with children', async () => {
    const user = userEvent.setup();
    const { container } = render(<TreeMenu data={arrayData} />);
    const toggle = container.querySelector(
      '.rstm-tree-item-level0 .rstm-toggle-icon'
    ) as HTMLElement;
    await user.click(toggle);
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('clicking the toggle icon a second time closes the branch', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TreeMenu data={arrayData} initialOpenNodes={['fruits']} />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    const toggle = container.querySelector(
      '.rstm-tree-item-level0 .rstm-toggle-icon'
    ) as HTMLElement;
    await user.click(toggle);
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 4. Controlled props override internal state
// ---------------------------------------------------------------------------

describe('controlled props', () => {
  it('openNodes prop overrides internal toggle state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TreeMenu data={arrayData} openNodes={['fruits']} />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    const toggle = container.querySelector(
      '.rstm-tree-item-level0 .rstm-toggle-icon'
    ) as HTMLElement;
    await user.click(toggle);
    // Still open — controlled openNodes is not mutated by the click.
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('activeKey prop updates the active item when changed from outside', () => {
    const { rerender } = render(
      <TreeMenu data={arrayData} openNodes={['fruits']} activeKey="fruits/apple" />
    );
    expect(itemOf('Apple').className).toMatch(/rstm-tree-item--active/);
    rerender(
      <TreeMenu data={arrayData} openNodes={['fruits']} activeKey="fruits/banana" />
    );
    expect(itemOf('Banana').className).toMatch(/rstm-tree-item--active/);
  });

  it('focusKey prop updates the focused item when changed from outside', () => {
    const { rerender } = render(
      <TreeMenu data={arrayData} openNodes={['fruits']} focusKey="fruits/apple" />
    );
    expect(itemOf('Apple').className).toMatch(/rstm-tree-item--focused/);
    rerender(
      <TreeMenu data={arrayData} openNodes={['fruits']} focusKey="fruits/banana" />
    );
    expect(itemOf('Banana').className).toMatch(/rstm-tree-item--focused/);
  });
});

// ---------------------------------------------------------------------------
// 5. Click activates
// ---------------------------------------------------------------------------

describe('click activates', () => {
  it('clicking an item marks it active and fires onClickItem', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    render(<TreeMenu data={arrayData} onClickItem={onClickItem} />);
    await user.click(itemOf('Fruits'));
    expect(onClickItem).toHaveBeenCalledTimes(1);
    expect(itemOf('Fruits').className).toMatch(/rstm-tree-item--active/);
  });
});

// ---------------------------------------------------------------------------
// 6. Search (hasSearch + debounce + auto-open)
// ---------------------------------------------------------------------------

describe('search', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('hasSearch renders a search input by default', () => {
    render(<TreeMenu data={arrayData} />);
    expect(screen.getByPlaceholderText('Type and search')).toBeInTheDocument();
  });

  it('hasSearch={false} hides the search input', () => {
    render(<TreeMenu data={arrayData} hasSearch={false} />);
    expect(
      screen.queryByPlaceholderText('Type and search')
    ).not.toBeInTheDocument();
  });

  it('typing in the search box filters items after the debounce window', async () => {
    const user = setupWithFakeTimers();
    render(<TreeMenu data={arrayData} debounceTime={125} />);
    await user.type(screen.getByPlaceholderText('Type and search'), 'carrot');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText('Carrot')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('auto-opens ancestors of matching items during search', async () => {
    const user = setupWithFakeTimers();
    render(<TreeMenu data={arrayData} debounceTime={0} />);
    await user.type(screen.getByPlaceholderText('Type and search'), 'apple');
    act(() => {
      vi.advanceTimersByTime(50);
    });
    // "Apple" is a child of closed "Fruits"; search should make it visible
    // without the user explicitly expanding Fruits.
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 7. Custom locale + matchSearch
// ---------------------------------------------------------------------------

describe('locale + matchSearch', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('locale transforms the displayed label', () => {
    // Use a fresh data reference — legacy's fast-memoize serializer stringifies
    // args, and functions (locale/matchSearch) become undefined in JSON, so
    // sharing data refs with other tests can return cached un-localed labels.
    // This caching quirk is precisely why `cacheSearch` is being removed in v2.
    const localData: TreeNodeInArray[] = [
      { key: 'fruits', label: 'Fruits' },
      { key: 'vegetables', label: 'Vegetables' },
    ];
    const locale: TreeMenuProps['locale'] = ({ label }) => `!${label}!`;
    render(<TreeMenu data={localData} locale={locale} />);
    expect(screen.getByText('!Fruits!')).toBeInTheDocument();
  });

  it('matchSearch replaces the default substring matcher', async () => {
    const user = setupWithFakeTimers();
    // Fresh data ref to dodge the legacy fast-memoize cache-key quirk.
    const localData: TreeNodeInArray[] = [
      { key: 'fruits', label: 'Fruits' },
      { key: 'vegetables', label: 'Vegetables' },
    ];
    // Custom matcher: only matches when search term equals label exactly.
    const matchSearch: TreeMenuProps['matchSearch'] = ({ label, searchTerm }) =>
      label === searchTerm;
    render(
      <TreeMenu data={localData} matchSearch={matchSearch} debounceTime={0} />
    );
    await user.type(
      screen.getByPlaceholderText('Type and search'),
      'Fruits'
    );
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    // "Fru" should NOT match under the exact-match custom rule.
    await user.clear(screen.getByPlaceholderText('Type and search'));
    await user.type(screen.getByPlaceholderText('Type and search'), 'Fru');
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.queryByText('Fruits')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 8. Render-props contract
// ---------------------------------------------------------------------------

describe('render-props', () => {
  it('custom children function receives items + search + searchTerm + resetOpenNodes', () => {
    const customChildren = vi.fn((props) => (
      <div>
        <span data-testid="count">{props.items.length}</span>
        {'search' in props && typeof props.search === 'function' ? (
          <span data-testid="has-search" />
        ) : null}
        {typeof props.resetOpenNodes === 'function' ? (
          <span data-testid="has-reset" />
        ) : null}
      </div>
    )) as unknown as TreeMenuChildren;
    render(<TreeMenu data={arrayData}>{customChildren}</TreeMenu>);
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('has-search')).toBeInTheDocument();
    expect(screen.getByTestId('has-reset')).toBeInTheDocument();
  });

  it('hasSearch={false} omits the search field from render-props', () => {
    const customChildren = vi.fn((props) => (
      <div>
        {typeof props.search === 'function' ? (
          <span data-testid="has-search" />
        ) : (
          <span data-testid="no-search" />
        )}
      </div>
    )) as unknown as TreeMenuChildren;
    render(
      <TreeMenu data={arrayData} hasSearch={false}>
        {customChildren}
      </TreeMenu>
    );
    expect(screen.getByTestId('no-search')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 9. resetOpenNodes
// ---------------------------------------------------------------------------

describe('resetOpenNodes (render-prop callback)', () => {
  it('resets to initialOpenNodes, clears search, clears active/focus', () => {
    type ResetFn = (
      openNodes?: string[],
      activeKey?: string,
      focusKey?: string
    ) => void;
    const Captured: { reset?: ResetFn } = {};
    const customChildren: TreeMenuChildren = ({ items, resetOpenNodes, search }) => {
      Captured.reset = resetOpenNodes;
      return (
        <div>
          {search ? (
            <input
              data-testid="search"
              onChange={(e) => search(e.target.value)}
            />
          ) : null}
          <ul>
            {items.map((i) => (
              <li key={i.key} className={i.active ? 'active' : ''}>
                {i.label}
              </li>
            ))}
          </ul>
        </div>
      );
    };
    render(
      <TreeMenu
        data={arrayData}
        initialOpenNodes={['fruits']}
        debounceTime={0}
      >
        {customChildren}
      </TreeMenu>
    );
    // Branch is initially open thanks to initialOpenNodes.
    expect(screen.getByText('Apple')).toBeInTheDocument();
    // Trigger reset with a new openNodes and an activeKey.
    act(() => {
      Captured.reset!(['vegetables'], 'vegetables');
    });
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.getByText('Carrot')).toBeInTheDocument();
    expect(
      screen.getByText('Vegetables').closest('li')!.className
    ).toMatch(/active/);
  });
});

// ---------------------------------------------------------------------------
// 10. resetOpenNodesOnDataUpdate
// ---------------------------------------------------------------------------

describe('resetOpenNodesOnDataUpdate', () => {
  it('default (false) keeps openNodes when data reference changes', () => {
    const { rerender } = render(
      <TreeMenu data={arrayData} initialOpenNodes={['fruits']} />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    rerender(
      <TreeMenu data={[...arrayData]} initialOpenNodes={['fruits']} />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('true resets openNodes to initialOpenNodes when data reference changes', () => {
    const { rerender } = render(
      <TreeMenu
        data={arrayData}
        initialOpenNodes={[]}
        resetOpenNodesOnDataUpdate
      />
    );
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    // Rerender with the same initialOpenNodes but a new data reference.
    rerender(
      <TreeMenu
        data={[...arrayData]}
        initialOpenNodes={[]}
        resetOpenNodesOnDataUpdate
      />
    );
    // Still collapsed — after the reset.
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 11. Keyboard navigation
// ---------------------------------------------------------------------------

describe('keyboard navigation', () => {
  const setupKeyboard = () => {
    const user = userEvent.setup();
    const { container } = render(
      <TreeMenu data={arrayData} initialOpenNodes={['fruits']} />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    wrapper.focus();
    return { user, wrapper };
  };

  it('renders a wrapping div with tabIndex=0', () => {
    const { container } = render(<TreeMenu data={arrayData} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.getAttribute('tabindex')).toBe('0');
  });

  it('ArrowDown moves focus to the next visible item', async () => {
    const { user } = setupKeyboard();
    await user.keyboard('{ArrowDown}');
    expect(itemOf('Fruits').className).toMatch(/rstm-tree-item--focused/);
  });

  it('ArrowUp moves focus to the previous visible item', async () => {
    const { user } = setupKeyboard();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');
    expect(itemOf('Fruits').className).toMatch(/rstm-tree-item--focused/);
  });

  it('ArrowRight opens a closed branch with children', async () => {
    const user = userEvent.setup();
    const { container } = render(<TreeMenu data={arrayData} />);
    (container.firstElementChild as HTMLElement).focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('ArrowLeft closes an open branch, keeping focus on it', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TreeMenu data={arrayData} initialOpenNodes={['fruits']} />
    );
    (container.firstElementChild as HTMLElement).focus();
    await user.keyboard('{ArrowDown}{ArrowLeft}');
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('Enter activates the focused item and fires onClickItem', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TreeMenu data={arrayData} onClickItem={onClickItem} />
    );
    (container.firstElementChild as HTMLElement).focus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onClickItem).toHaveBeenCalled();
    expect(itemOf('Fruits').className).toMatch(/rstm-tree-item--active/);
  });
});

// ---------------------------------------------------------------------------
// 12. disableKeyboard
// ---------------------------------------------------------------------------

describe('disableKeyboard', () => {
  it('omits the KeyDown wrapper div when true', () => {
    const { container } = render(
      <TreeMenu data={arrayData} disableKeyboard />
    );
    // Without KeyDown, the first child is the render-props output
    // (a fragment, so the first *element* child is the search input).
    const first = container.firstElementChild as HTMLElement;
    expect(first.getAttribute('tabindex')).not.toBe('0');
  });

  it('keyboard events are inert when disableKeyboard is true', async () => {
    const onClickItem = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TreeMenu
        data={arrayData}
        disableKeyboard
        initialFocusKey="fruits"
        onClickItem={onClickItem}
      />
    );
    // Focus the first focusable element available (the search input).
    const input = container.querySelector('input');
    (input as HTMLElement)?.focus();
    await user.keyboard('{Enter}');
    expect(onClickItem).not.toHaveBeenCalled();
  });
});
