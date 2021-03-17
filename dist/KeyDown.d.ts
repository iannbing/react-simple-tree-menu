/// <reference types="react" />
interface KeyDownProps {
    children: JSX.Element | string;
    up: () => void;
    down: () => void;
    left: () => void;
    right: () => void;
    enter: () => void;
}
declare const KeyDown: ({ children, up, down, left, right, enter }: KeyDownProps) => JSX.Element;
export default KeyDown;
//# sourceMappingURL=KeyDown.d.ts.map