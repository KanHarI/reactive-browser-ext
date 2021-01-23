"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordProxy = void 0;
var async_mutex_1 = require("async-mutex");
var RecordUtils_1 = require("./utils/RecordUtils");
var RecordProxy = /** @class */ (function () {
    function RecordProxy() {
        this.$parent = null;
        this.$mutex = new async_mutex_1.Mutex();
        this.$internalProxyTarget = {};
        this.$reactiveChildren = {};
        this.$inactiveCallbacks = { $thisCallbacks: {}, $onCallbacks: {} };
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var thisRecordProxy = this;
        var handler = {
            get: function (target, key) {
                if (key[0] === "$") {
                    // Accessing special properties of the proxy
                    return Reflect.get(thisRecordProxy, key);
                }
                if (key in thisRecordProxy.$reactiveChildren) {
                    // Accessing a reactive child - returning its proxy, it will handle whatever comes
                    return thisRecordProxy.$reactiveChildren[key];
                }
                // Accessing a non-reactive (immutable) child - return it's value
                return Reflect.get(thisRecordProxy.$internalProxyTarget, key);
            },
            defineProperty: function (target, key, desc) {
                if (key[0] === "$") {
                    throw "Cannot set properties starting with '$' - they are special properties of the reactive state!";
                }
                var wasReactive = key in thisRecordProxy.$reactiveChildren;
                switch (typeof desc.value) {
                    case "object": {
                        // Ignore the null case for now
                        var deepCopiedProxy = RecordUtils_1.deepCopyRecordToProxy(desc.value !== null ? desc.value : {});
                        // If object was reactive - copy old callbacks into new object
                        if (wasReactive) {
                            var callbacks = thisRecordProxy.$reactiveChildren[key].$getCallbacks();
                            deepCopiedProxy.$addCallbacks(callbacks);
                        }
                        // If we have inactive callbacks for current object - register them
                        if (key in thisRecordProxy.$inactiveCallbacks.$onCallbacks) {
                            var callbacks = thisRecordProxy.$inactiveCallbacks.$onCallbacks[key];
                            deepCopiedProxy.$addCallbacks(callbacks);
                        }
                        // If we have immutables callbacks - move them to new object
                        if (key in thisRecordProxy.$postUpdateCallbacksOn) {
                            for (var _i = 0, _a = Object.keys(thisRecordProxy.$postUpdateCallbacksOn[key]); _i < _a.length; _i++) {
                                var callbackName = _a[_i];
                                deepCopiedProxy.$addPostUpdateCallback(callbackName, thisRecordProxy.$postUpdateCallbacksOn[key][callbackName]);
                            }
                            delete thisRecordProxy.$postUpdateCallbacksOn[key];
                        }
                        // Invalidate all callbacks recursively
                        deepCopiedProxy.$invalidateDown();
                        thisRecordProxy.$reactiveChildren[key] = deepCopiedProxy;
                        desc.value = deepCopiedProxy;
                        var result = Reflect.defineProperty(target, key, desc);
                        thisRecordProxy.$invalidateUp();
                        return result;
                    }
                    // Immutable types
                    case "number":
                    case "string":
                    case "bigint":
                    case "boolean": {
                        if (key in thisRecordProxy.$reactiveChildren) {
                            var overwrittenCallbacks = {
                                $thisCallbacks: {},
                                $onCallbacks: {},
                            };
                            overwrittenCallbacks.$onCallbacks[key] = thisRecordProxy.$reactiveChildren[key].$getCallbacks();
                            thisRecordProxy.$reactiveChildren[key].$delete();
                            delete thisRecordProxy.$reactiveChildren[key];
                            thisRecordProxy.$addCallbacks(overwrittenCallbacks);
                        }
                        if (key in thisRecordProxy.$postUpdateCallbacksOn) {
                            for (var _b = 0, _c = Object.values(thisRecordProxy.$postUpdateCallbacksOn[key]); _b < _c.length; _b++) {
                                var f = _c[_b];
                                f(desc.value);
                            }
                        }
                        var result = Reflect.defineProperty(target, key, desc);
                        thisRecordProxy.$invalidateUp();
                        return result;
                    }
                    default: {
                        throw "Not implemented setting of type " + typeof desc.value;
                    }
                }
            },
            deleteProperty: function (target, key) {
                if (key in thisRecordProxy.$postUpdateCallbacksOn) {
                    for (var _i = 0, _a = Object.values(thisRecordProxy.$postUpdateCallbacksOn[key]); _i < _a.length; _i++) {
                        var callback = _a[_i];
                        callback(null);
                    }
                }
                if (key in thisRecordProxy.$reactiveChildren) {
                    var deletedCallbacks = thisRecordProxy.$reactiveChildren[key].$getCallbacks();
                    thisRecordProxy.$reactiveChildren[key].$delete();
                    delete thisRecordProxy.$reactiveChildren[key];
                    var addedCallbacks = {
                        $thisCallbacks: {},
                        $onCallbacks: { key: deletedCallbacks },
                    };
                    thisRecordProxy.$addCallbacks(addedCallbacks);
                }
                return Reflect.deleteProperty(target, key);
            },
        };
        this.$proxy = new Proxy(this.$internalProxyTarget, handler);
        this.$postUpdateCallbacks = {};
        this.$postUpdateCallbacksOn = {};
    }
    RecordProxy.prototype.$atomicCallback = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var thisRecordProxy;
            return __generator(this, function (_a) {
                thisRecordProxy = this;
                return [2 /*return*/, this.$mutex.acquire().then(function (release) {
                        var result = undefined;
                        try {
                            result = f(thisRecordProxy.$proxy);
                        }
                        finally {
                            release();
                        }
                        for (var _i = 0, _a = Object.values(thisRecordProxy.$postUpdateCallbacks); _i < _a.length; _i++) {
                            var f_1 = _a[_i];
                            f_1(thisRecordProxy.$proxy);
                        }
                        return result;
                    })];
            });
        });
    };
    RecordProxy.prototype.$asyncAtomicCallback = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var thisRecordProxy;
            var _this = this;
            return __generator(this, function (_a) {
                thisRecordProxy = this;
                return [2 /*return*/, this.$mutex.acquire().then(function (release) { return __awaiter(_this, void 0, void 0, function () {
                        var result, _i, _a, f_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    result = undefined;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, , 3, 4]);
                                    return [4 /*yield*/, f(thisRecordProxy.$proxy)];
                                case 2:
                                    result = _b.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    release();
                                    return [7 /*endfinally*/];
                                case 4:
                                    for (_i = 0, _a = Object.values(thisRecordProxy.$postUpdateCallbacks); _i < _a.length; _i++) {
                                        f_2 = _a[_i];
                                        f_2(thisRecordProxy.$proxy);
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); })];
            });
        });
    };
    RecordProxy.prototype.$addPostUpdateCallback = function (name, f) {
        this.$postUpdateCallbacks[name] = f;
    };
    RecordProxy.prototype.$addPostUpdateCallbackOn = function (on, name, f) {
        if (on in this.$reactiveChildren) {
            this.$reactiveChildren[on].$addPostUpdateCallback(name, f);
            return;
        }
        if (!(on in this.$postUpdateCallbacksOn)) {
            this.$postUpdateCallbacksOn[on] = {};
        }
        this.$postUpdateCallbacksOn[on][name] = f;
    };
    RecordProxy.prototype.$removePostUpdateCallback = function (name) {
        delete this.$postUpdateCallbacks[name];
    };
    RecordProxy.prototype.$removePostUpdateCallbackOn = function (name, on) {
        delete this.$postUpdateCallbacksOn[on][name];
    };
    RecordProxy.prototype.$invalidateDown = function () {
        for (var _i = 0, _a = Object.values(this.$reactiveChildren); _i < _a.length; _i++) {
            var child = _a[_i];
            child.$invalidateDown();
        }
        for (var _b = 0, _c = Object.keys(this.$postUpdateCallbacksOn); _b < _c.length; _b++) {
            var key = _c[_b];
            var value = this.$proxy[key];
            for (var _d = 0, _e = Object.values(this.$postUpdateCallbacksOn[key]); _d < _e.length; _d++) {
                var f = _e[_d];
                f(value);
            }
        }
        for (var _f = 0, _g = Object.values(this.$postUpdateCallbacks); _f < _g.length; _f++) {
            var f = _g[_f];
            f(this.$proxy);
        }
    };
    RecordProxy.prototype.$invalidateUp = function () {
        for (var _i = 0, _a = Object.values(this.$postUpdateCallbacks); _i < _a.length; _i++) {
            var f = _a[_i];
            f(this.$proxy);
        }
        if (this.$parent !== null) {
            this.$parent.$invalidateUp();
        }
    };
    RecordProxy.prototype.$getProxy = function () {
        return this.$proxy;
    };
    RecordProxy.prototype.$delete = function () {
        for (var _i = 0, _a = Object.values(this.$reactiveChildren); _i < _a.length; _i++) {
            var child = _a[_i];
            child.$delete();
        }
        for (var _b = 0, _c = Object.keys(this.$postUpdateCallbacksOn); _b < _c.length; _b++) {
            var key = _c[_b];
            for (var _d = 0, _e = Object.values(this.$postUpdateCallbacksOn[key]); _d < _e.length; _d++) {
                var f = _e[_d];
                f(null);
            }
        }
        for (var _f = 0, _g = Object.values(this.$postUpdateCallbacks); _f < _g.length; _f++) {
            var f = _g[_f];
            f(null);
        }
    };
    RecordProxy.prototype.$addCallbacks = function (callbacks) {
        for (var _i = 0, _a = Object.keys(callbacks.$thisCallbacks); _i < _a.length; _i++) {
            var callbackName = _a[_i];
            this.$addPostUpdateCallback(callbackName, callbacks.$thisCallbacks[callbackName]);
        }
        for (var _b = 0, _c = Object.keys(callbacks.$onCallbacks); _b < _c.length; _b++) {
            var key = _c[_b];
            if (key in this.$reactiveChildren) {
                this.$reactiveChildren[key].$addCallbacks(callbacks.$onCallbacks[key]);
            }
            else {
                if (!(key in this.$postUpdateCallbacksOn)) {
                    this.$postUpdateCallbacksOn = {};
                }
                for (var _d = 0, _e = Object.keys(callbacks.$onCallbacks[key].$thisCallbacks); _d < _e.length; _d++) {
                    var callbackName = _e[_d];
                    this.$postUpdateCallbacksOn[key][callbackName] = callbacks
                        .$onCallbacks[key].$thisCallbacks[callbackName];
                }
                for (var _f = 0, _g = Object.keys(callbacks.$onCallbacks[key].$onCallbacks); _f < _g.length; _f++) {
                    var callbackKey = _g[_f];
                    if (!(key in this.$inactiveCallbacks.$onCallbacks)) {
                        this.$inactiveCallbacks.$onCallbacks[key] = {
                            $thisCallbacks: {},
                            $onCallbacks: {},
                        };
                    }
                    this.$inactiveCallbacks.$onCallbacks[key].$onCallbacks[callbackKey] =
                        callbacks.$onCallbacks[key].$onCallbacks[callbackKey];
                }
            }
        }
    };
    RecordProxy.prototype.$getCallbacks = function () {
        var callbacks = { $thisCallbacks: {}, $onCallbacks: {} };
        for (var _i = 0, _a = Object.keys(this.$postUpdateCallbacks); _i < _a.length; _i++) {
            var callbackName = _a[_i];
            callbacks.$thisCallbacks[callbackName] = this.$postUpdateCallbacks[callbackName];
        }
        for (var _b = 0, _c = Object.keys(this.$reactiveChildren); _b < _c.length; _b++) {
            var key = _c[_b];
            callbacks.$onCallbacks[key] = this.$reactiveChildren[key].$getCallbacks();
        }
        for (var _d = 0, _e = Object.keys(this.$postUpdateCallbacksOn); _d < _e.length; _d++) {
            var key = _e[_d];
            if (!(key in callbacks.$onCallbacks)) {
                callbacks.$onCallbacks[key] = { $thisCallbacks: {}, $onCallbacks: {} };
            }
            for (var _f = 0, _g = Object.keys(this.$postUpdateCallbacksOn[key]); _f < _g.length; _f++) {
                var callbackName = _g[_f];
                callbacks.$onCallbacks[key].$thisCallbacks[callbackName] = this.$postUpdateCallbacksOn[key][callbackName];
            }
        }
        return callbacks;
    };
    RecordProxy.prototype.$setParent = function (parent) {
        this.$parent = parent;
    };
    return RecordProxy;
}());
exports.RecordProxy = RecordProxy;
//# sourceMappingURL=recordProxy.js.map