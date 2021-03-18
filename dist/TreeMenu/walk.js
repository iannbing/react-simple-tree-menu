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
import isEmpty from 'is-empty';
import memoize from 'fast-memoize';
import hash from './fastSerializer';
var validateData = function (data) { return !!data && !isEmpty(data); };
var getValidatedData = function (data) {
    return validateData(data) ? data : [];
};
var walk = function (_a) {
    var data = _a.data, props = __rest(_a, ["data"]);
    var validatedData = getValidatedData(data);
    var propsWithDefaultValues = __assign({ parent: '', level: 0 }, props);
    var handleArray = function (dataAsArray) {
        return dataAsArray.reduce(function (all, node, index) {
            var branchProps = __assign({ node: node, index: index, nodeName: node.key }, propsWithDefaultValues);
            var branch = generateBranch(branchProps);
            return __spreadArrays(all, branch);
        }, []);
    };
    var handleObject = function (dataAsObject) {
        return Object.entries(dataAsObject)
            .sort(function (a, b) { return a[1].index - b[1].index; }) // sorted by index
            .reduce(function (all, _a) {
            var nodeName = _a[0], node = _a[1];
            var branchProps = __assign({ node: node, nodeName: nodeName }, propsWithDefaultValues);
            var branch = generateBranch(branchProps);
            return __spreadArrays(all, branch);
        }, []);
    };
    return Array.isArray(validatedData)
        ? handleArray(validatedData)
        : handleObject(validatedData);
};
var defaultMatchSearch = function (_a) {
    var label = _a.label, searchTerm = _a.searchTerm;
    var processString = function (text) { return text.trim().toLowerCase(); };
    return processString(label).includes(processString(searchTerm));
};
var defaultLocale = function (_a) {
    var label = _a.label;
    return label;
};
var generateBranch = function (_a) {
    var node = _a.node, nodeName = _a.nodeName, _b = _a.matchSearch, matchSearch = _b === void 0 ? defaultMatchSearch : _b, _c = _a.locale, locale = _c === void 0 ? defaultLocale : _c, props = __rest(_a, ["node", "nodeName", "matchSearch", "locale"]);
    var parent = props.parent, level = props.level, openNodes = props.openNodes, searchTerm = props.searchTerm;
    var nodes = node.nodes, _d = node.label, rawLabel = _d === void 0 ? 'unknown' : _d, nodeProps = __rest(node, ["nodes", "label"]);
    var key = [parent, nodeName].filter(function (x) { return x; }).join('/');
    var hasNodes = validateData(nodes);
    var isOpen = hasNodes && (openNodes.includes(key) || !!searchTerm);
    var label = locale(__assign({ label: rawLabel }, nodeProps));
    var isVisible = !searchTerm || matchSearch(__assign({ label: label, searchTerm: searchTerm }, nodeProps));
    var currentItem = __assign(__assign(__assign({}, props), nodeProps), { label: label, hasNodes: hasNodes, isOpen: isOpen, key: key });
    var data = getValidatedData(nodes);
    var nextLevelItems = isOpen
        ? walk(__assign(__assign({ data: data, locale: locale, matchSearch: matchSearch }, props), { parent: key, level: level + 1 }))
        : [];
    return isVisible ? __spreadArrays([currentItem], nextLevelItems) : nextLevelItems;
};
function specialSerializer() {
    return hash(arguments);
}
;
export var fastWalk = memoize(walk, {
    serializer: specialSerializer
});
export var slowWalk = walk;
//# sourceMappingURL=walk.js.map