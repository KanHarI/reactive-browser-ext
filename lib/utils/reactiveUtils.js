"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopyToReactiveProxy = void 0;
var __1 = require("..");
function deepCopyToReactiveProxy(x) {
    var newObj = null;
    if (Array.isArray(x)) {
        newObj = new __1.ArrayProxy().$getProxy();
    }
    else {
        // This is definently lying - we get back an array. But this type checks
        // and works unlike the alternative...
        newObj = new __1.RecordProxy().$getProxy();
    }
    var isReactive = false;
    for (var _i = 0, _a = Object.keys(x); _i < _a.length; _i++) {
        var key = _a[_i];
        if (key[0] === "$") {
            isReactive = true;
        }
    }
    if (isReactive) {
        // TODO: Implement reading internal state and performing a deep copy
        throw "Not implemented yet!";
    }
    for (var _b = 0, _c = Object.keys(x); _b < _c.length; _b++) {
        var key = _c[_b];
        newObj[key] = x[key];
    }
    return newObj;
}
exports.deepCopyToReactiveProxy = deepCopyToReactiveProxy;
//# sourceMappingURL=reactiveUtils.js.map