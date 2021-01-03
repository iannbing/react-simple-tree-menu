import React, { KeyboardEvent } from 'react';

export interface KeyDownProps {
  children: JSX.Element | string;
  up: () => void;
  down: () => void;
  left: () => void;
  right: () => void;
  enter: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => any;
}

const KeyDown = ({ children, up, down, left, right, enter, onKeyDown }: KeyDownProps) => {
  return (
    <div
      tabIndex={0}
      onKeyDown={e => {
        switch (e.key) {
          case 'ArrowUp': {
            up();
            break;
          }
          case 'ArrowDown': {
            down();
            break;
          }
          case 'ArrowLeft': {
            left();
            break;
          }
          case 'ArrowRight': {
            right();
            break;
          }

          case 'Enter': {
            enter();
            break;
          }
        }
        onKeyDown?.(e);
      }}
    >
      {children}
    </div>
  );
};

export default KeyDown;
