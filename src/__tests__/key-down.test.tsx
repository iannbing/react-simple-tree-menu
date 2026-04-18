// Direct tests for v2 KeyDown. Preserves the legacy public DOM shape
// (`<div tabIndex={0} onKeyDown={...}>`) per SPEC §11.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyDown } from '../key-down';

const makeHandlers = () => ({
  up: vi.fn(),
  down: vi.fn(),
  left: vi.fn(),
  right: vi.fn(),
  enter: vi.fn(),
});

describe('KeyDown wrapper — SPEC §7 + §11', () => {
  it('renders a div with tabIndex=0 containing its children', () => {
    const h = makeHandlers();
    render(
      <KeyDown {...h}>
        <span data-testid="child">hello</span>
      </KeyDown>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    const wrapper = screen.getByTestId('child').parentElement!;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.getAttribute('tabindex')).toBe('0');
  });

  it.each([
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['Enter', 'enter'],
  ] as const)('%s fires the %s handler', async (key, handlerName) => {
    const h = makeHandlers();
    const user = userEvent.setup();
    render(
      <KeyDown {...h}>
        <span data-testid="child">x</span>
      </KeyDown>
    );
    const wrapper = screen.getByTestId('child').parentElement!;
    wrapper.focus();
    await user.keyboard(`{${key}}`);
    expect(h[handlerName]).toHaveBeenCalledTimes(1);
    // Other handlers should not have fired.
    for (const other of Object.keys(h) as (keyof typeof h)[]) {
      if (other !== handlerName) expect(h[other]).not.toHaveBeenCalled();
    }
  });

  it('ignores unknown keys', async () => {
    const h = makeHandlers();
    const user = userEvent.setup();
    render(
      <KeyDown {...h}>
        <span data-testid="child">x</span>
      </KeyDown>
    );
    screen.getByTestId('child').parentElement!.focus();
    await user.keyboard('{a}{b}{Escape}{Tab}');
    for (const handler of Object.values(h)) {
      expect(handler).not.toHaveBeenCalled();
    }
  });
});
