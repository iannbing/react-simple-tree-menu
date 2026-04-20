// Keyboard-navigation wrapper. Preserves the legacy <div tabIndex={0}>
// DOM shape exactly — the presence of this wrapping element is public
// API (consumers depend on it for focus management). SPEC §7 + §11.

import type { KeyboardEvent, ReactElement, ReactNode } from 'react';

export interface KeyDownProps {
  children: ReactNode;
  up: () => void;
  down: () => void;
  left: () => void;
  right: () => void;
  enter: () => void;
}

export function KeyDown({
  children,
  up,
  down,
  left,
  right,
  enter,
}: KeyDownProps): ReactElement {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Don't hijack the keys when focus is inside a text input (our own
    // search box, or any consumer-supplied input) — arrow keys should
    // still move the text cursor, Enter should still submit a form,
    // etc. Only intercept when focus is on the tree itself or the
    // wrapper.
    const target = e.target as HTMLElement | null;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        up();
        break;
      case 'ArrowDown':
        down();
        break;
      case 'ArrowLeft':
        left();
        break;
      case 'ArrowRight':
        right();
        break;
      case 'Enter':
        enter();
        break;
      default:
        return;
    }

    // Matched a tree-navigation key — stop the browser's default action
    // (e.g. arrow keys scrolling the page, Enter inserting a newline in
    // a containing textarea). Without this, the page and the tree both
    // respond to the same keystroke.
    e.preventDefault();
  };

  // The wrapping <div tabIndex={0}> is part of v1's public DOM shape —
  // consumers rely on it for focus management. Lint wants interactive
  // roles on tabbable elements, but the interactive semantics live on the
  // inner <ul role="tree">; this div is a focus/event collector only.
  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */
    <div tabIndex={0} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

export default KeyDown;
