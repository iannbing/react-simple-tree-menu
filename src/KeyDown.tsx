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
