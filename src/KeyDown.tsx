import React from 'react';

interface KeyDownProps {
  children: JSX.Element | string;
  up: () => void;
  down: () => void;
  left: () => void;
  right: () => void;
  enter: () => void;
  className?: string;
  style?: object;
  id?: string;
}

const KeyDown = ({ className, style, id, children, up, down, left, right, enter }: KeyDownProps) => {
  return (
    <div
      tabIndex={0}
      className={className}
      style={style}
      id={id}
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
      }}
    >
      {children}
    </div>
  );
};

export default KeyDown;
