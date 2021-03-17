import React from 'react';
var KeyDown = function (_a) {
    var children = _a.children, up = _a.up, down = _a.down, left = _a.left, right = _a.right, enter = _a.enter;
    return (React.createElement("div", { tabIndex: 0, onKeyDown: function (e) {
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
        } }, children));
};
export default KeyDown;
//# sourceMappingURL=KeyDown.js.map