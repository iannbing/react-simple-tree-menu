var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import React from 'react';
import debounce from 'tiny-debounce';
import { fastWalk, slowWalk, } from './walk';
import { defaultChildren } from './renderProps';
import KeyDown from '../KeyDown';
var defaultOnClick = function (props) { return console.log(props); }; // eslint-disable-line no-console
var TreeMenu = /** @class */ (function (_super) {
    __extends(TreeMenu, _super);
    function TreeMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            openNodes: _this.props.initialOpenNodes || [],
            searchTerm: '',
            activeKey: _this.props.initialActiveKey || '',
            focusKey: _this.props.initialFocusKey || '',
        };
        _this.resetOpenNodes = function (newOpenNodes, activeKey, focusKey) {
            var initialOpenNodes = _this.props.initialOpenNodes;
            var openNodes = (Array.isArray(newOpenNodes) && newOpenNodes) || initialOpenNodes || [];
            _this.setState({ openNodes: openNodes, searchTerm: '', activeKey: activeKey || '', focusKey: focusKey || activeKey || '' });
        };
        _this.search = function (value) {
            var debounceTime = _this.props.debounceTime;
            var search = debounce(function (searchTerm) { return _this.setState({ searchTerm: searchTerm }); }, debounceTime);
            search(value);
        };
        _this.toggleNode = function (node) {
            if (!_this.props.openNodes) {
                var openNodes = _this.state.openNodes;
                var newOpenNodes = openNodes.includes(node)
                    ? openNodes.filter(function (openNode) { return openNode !== node; })
                    : __spreadArrays(openNodes, [node]);
                _this.setState({ openNodes: newOpenNodes });
            }
        };
        _this.generateItems = function () {
            var _a = _this.props, data = _a.data, onClickItem = _a.onClickItem, locale = _a.locale, matchSearch = _a.matchSearch;
            var searchTerm = _this.state.searchTerm;
            var openNodes = _this.props.openNodes || _this.state.openNodes;
            var activeKey = _this.props.activeKey || _this.state.activeKey;
            var focusKey = _this.props.focusKey || _this.state.focusKey;
            var defaultSearch = _this.props.cacheSearch ? fastWalk : slowWalk;
            var items = data
                ? defaultSearch({ data: data, openNodes: openNodes, searchTerm: searchTerm, locale: locale, matchSearch: matchSearch })
                : [];
            return items.map(function (item) {
                var focused = item.key === focusKey;
                var active = item.key === activeKey;
                var onClick = function () {
                    var newActiveKey = _this.props.activeKey || item.key;
                    _this.setState({ activeKey: newActiveKey, focusKey: newActiveKey });
                    onClickItem && onClickItem(item);
                };
                var toggleNode = item.hasNodes ? function () { return _this.toggleNode(item.key); } : undefined;
                return __assign(__assign({}, item), { focused: focused, active: active, onClick: onClick, toggleNode: toggleNode });
            });
        };
        _this.getKeyDownProps = function (items) {
            var onClickItem = _this.props.onClickItem;
            var _a = _this.state, focusKey = _a.focusKey, activeKey = _a.activeKey, searchTerm = _a.searchTerm;
            var focusIndex = items.findIndex(function (item) { return item.key === (focusKey || activeKey); });
            var getFocusKey = function (item) {
                var keyArray = item.key.split('/');
                return keyArray.length > 1
                    ? keyArray.slice(0, keyArray.length - 1).join('/')
                    : item.key;
            };
            return {
                up: function () {
                    _this.setState(function (_a) {
                        var focusKey = _a.focusKey;
                        return ({
                            focusKey: focusIndex > 0 ? items[focusIndex - 1].key : focusKey,
                        });
                    });
                },
                down: function () {
                    _this.setState(function (_a) {
                        var focusKey = _a.focusKey;
                        return ({
                            focusKey: focusIndex < items.length - 1 ? items[focusIndex + 1].key : focusKey,
                        });
                    });
                },
                left: function () {
                    var item = items[focusIndex];
                    if (item) {
                        _this.setState(function (_a) {
                            var openNodes = _a.openNodes, rest = __rest(_a, ["openNodes"]);
                            var newOpenNodes = openNodes.filter(function (node) { return node !== item.key; });
                            return item.isOpen
                                ? __assign(__assign({}, rest), { openNodes: newOpenNodes, focusKey: item.key }) : __assign(__assign({}, rest), { focusKey: getFocusKey(item) });
                        });
                    }
                },
                right: function () {
                    var _a = items[focusIndex], hasNodes = _a.hasNodes, key = _a.key;
                    if (hasNodes)
                        _this.setState(function (_a) {
                            var openNodes = _a.openNodes;
                            return ({ openNodes: __spreadArrays(openNodes, [key]) });
                        });
                },
                enter: function () {
                    _this.setState(function (_a) {
                        var focusKey = _a.focusKey;
                        return ({ activeKey: focusKey });
                    });
                    onClickItem && onClickItem(items[focusIndex]);
                },
            };
        };
        return _this;
    }
    TreeMenu.prototype.componentDidUpdate = function (prevProps) {
        var _a = this.props, data = _a.data, initialOpenNodes = _a.initialOpenNodes, resetOpenNodesOnDataUpdate = _a.resetOpenNodesOnDataUpdate;
        if (prevProps.data !== data && resetOpenNodesOnDataUpdate && initialOpenNodes) {
            this.setState({ openNodes: initialOpenNodes });
        }
    };
    TreeMenu.prototype.render = function () {
        var _a = this.props, children = _a.children, hasSearch = _a.hasSearch, disableKeyboard = _a.disableKeyboard;
        var searchTerm = this.state.searchTerm;
        var search = this.search;
        var items = this.generateItems();
        var resetOpenNodes = this.resetOpenNodes;
        var render = children || defaultChildren;
        var renderProps = hasSearch
            ? {
                search: search,
                resetOpenNodes: resetOpenNodes,
                items: items,
                searchTerm: searchTerm,
            }
            : { items: items, resetOpenNodes: resetOpenNodes };
        return disableKeyboard ? (render(renderProps)) : (React.createElement(KeyDown, __assign({}, this.getKeyDownProps(items)), render(renderProps)));
    };
    TreeMenu.defaultProps = {
        data: {},
        onClickItem: defaultOnClick,
        debounceTime: 125,
        children: defaultChildren,
        hasSearch: true,
        cacheSearch: true,
        resetOpenNodesOnDataUpdate: false,
        disableKeyboard: false,
    };
    return TreeMenu;
}(React.Component));
export default TreeMenu;
//# sourceMappingURL=index.js.map