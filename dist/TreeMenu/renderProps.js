var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import classNames from 'classnames';
var DEFAULT_PADDING = 0.75;
var ICON_SIZE = 2;
var LEVEL_SPACE = 1.75;
var ToggleIcon = function (_a) {
    var on = _a.on, openedIcon = _a.openedIcon, closedIcon = _a.closedIcon;
    return (React.createElement("div", { role: "img", "aria-label": "Toggle", className: "rstm-toggle-icon-symbol" }, on ? openedIcon : closedIcon));
};
export var ItemComponent = function (_a) {
    var _b = _a.hasNodes, hasNodes = _b === void 0 ? false : _b, _c = _a.isOpen, isOpen = _c === void 0 ? false : _c, _d = _a.level, level = _d === void 0 ? 0 : _d, onClick = _a.onClick, toggleNode = _a.toggleNode, active = _a.active, focused = _a.focused, _e = _a.openedIcon, openedIcon = _e === void 0 ? '-' : _e, _f = _a.closedIcon, closedIcon = _f === void 0 ? '+' : _f, _g = _a.label, label = _g === void 0 ? 'unknown' : _g, _h = _a.style, style = _h === void 0 ? {} : _h;
    return (React.createElement("li", { className: classNames('rstm-tree-item', "rstm-tree-item-level" + level, { 'rstm-tree-item--active': active }, { 'rstm-tree-item--focused': focused }), style: __assign({ paddingLeft: DEFAULT_PADDING +
                ICON_SIZE * (hasNodes ? 0 : 1) +
                level * LEVEL_SPACE + "rem" }, style), role: "button", "aria-pressed": active, onClick: onClick },
        hasNodes && (React.createElement("div", { className: "rstm-toggle-icon", onClick: function (e) {
                hasNodes && toggleNode && toggleNode();
                e.stopPropagation();
            } },
            React.createElement(ToggleIcon, { on: isOpen, openedIcon: openedIcon, closedIcon: closedIcon }))),
        label));
};
export var defaultChildren = function (_a) {
    var search = _a.search, items = _a.items;
    var onSearch = function (e) {
        var value = e.target.value;
        search && search(value);
    };
    return (React.createElement(React.Fragment, null,
        search && (React.createElement("input", { className: "rstm-search", "aria-label": "Type and search", type: "search", placeholder: "Type and search", onChange: onSearch })),
        React.createElement("ul", { className: "rstm-tree-item-group" }, items.map(function (_a) {
            var key = _a.key, props = __rest(_a, ["key"]);
            return (React.createElement(ItemComponent, __assign({ key: key }, props)));
        }))));
};
//# sourceMappingURL=renderProps.js.map