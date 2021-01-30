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
exports.AbstractProxy = void 0;
var async_mutex_1 = require("async-mutex");
var _1 = require(".");
var AbstractProxy = /** @class */ (function () {
    function AbstractProxy(target, handlerMods, deepCopyToReactive) {
        if (handlerMods === void 0) { handlerMods = [{}]; }
        if (deepCopyToReactive === void 0) { deepCopyToReactive = _1.deepCopyToReactiveProxy; }
        this.$inactiveCallbacks = { $thisCallbacks: {}, $onCallbacks: {} };
        this.$internalProxyTarget = target;
        this.$postUpdateCallbacks = {};
        this.$postUpdateCallbacksOn = {};
        this.$mutex = new async_mutex_1.Mutex();
        this.$reactiveChildren = {};
        this.$parent = null;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var thisAbstractProxy = this;
        var handler = {
            get: function (target, key) {
                for (var _i = 0, handlerMods_1 = handlerMods; _i < handlerMods_1.length; _i++) {
                    var handlerMod = handlerMods_1[_i];
                    if (handlerMod.get) {
                        for (var _a = 0, _b = handlerMod.get; _a < _b.length; _a++) {
                            var getMod = _b[_a];
                            if (getMod[0](target, key)) {
                                return getMod[1](target, key);
                            }
                        }
                    }
                }
                if (key[0] === "$") {
                    // Accessing special properties of the proxy
                    return Reflect.get(thisAbstractProxy, key);
                }
                if (key in thisAbstractProxy.$reactiveChildren) {
                    // Accessing a reactive child - returning its proxy, it will handle whatever comes
                    return thisAbstractProxy.$reactiveChildren[key];
                }
                // Accessing a non-reactive (immutable) child - return it's value
                return Reflect.get(thisAbstractProxy.$internalProxyTarget, key);
            },
            defineProperty: function (target, key, desc) {
                for (var _i = 0, handlerMods_2 = handlerMods; _i < handlerMods_2.length; _i++) {
                    var handlerMod = handlerMods_2[_i];
                    if (handlerMod.defineProperty) {
                        for (var _a = 0, _b = handlerMod.defineProperty; _a < _b.length; _a++) {
                            var getMod = _b[_a];
                            if (getMod[0](target, key, desc)) {
                                return getMod[1](target, key, desc);
                            }
                        }
                    }
                }
                if (key[0] === "$") {
                    throw "Cannot set properties starting with '$' - they are special properties of the reactive state!";
                }
                var wasReactive = key in thisAbstractProxy.$reactiveChildren;
                switch (typeof desc.value) {
                    case "object": {
                        // Ignore the null case for now
                        var deepCopiedProxy = deepCopyToReactive(desc.value !== null ? desc.value : {});
                        // If object was reactive - copy old callbacks into new object
                        if (wasReactive) {
                            var callbacks = thisAbstractProxy.$reactiveChildren[key].$getCallbacks();
                            deepCopiedProxy.$addCallbacks(callbacks);
                        }
                        // If we have inactive callbacks for current object - register them
                        if (key in thisAbstractProxy.$inactiveCallbacks.$onCallbacks) {
                            var callbacks = thisAbstractProxy.$inactiveCallbacks.$onCallbacks[key];
                            deepCopiedProxy.$addCallbacks(callbacks);
                        }
                        // If we have immutables callbacks - move them to new object
                        if (key in thisAbstractProxy.$postUpdateCallbacksOn) {
                            for (var _c = 0, _d = Object.keys(thisAbstractProxy.$postUpdateCallbacksOn[key]); _c < _d.length; _c++) {
                                var callbackName = _d[_c];
                                deepCopiedProxy.$addPostUpdateCallback(callbackName, thisAbstractProxy.$postUpdateCallbacksOn[key][callbackName]);
                            }
                            delete thisAbstractProxy.$postUpdateCallbacksOn[key];
                        }
                        // Invalidate all callbacks recursively
                        deepCopiedProxy.$invalidateDown();
                        thisAbstractProxy.$reactiveChildren[key] = deepCopiedProxy;
                        desc.value = deepCopiedProxy;
                        var result = Reflect.defineProperty(target, key, desc);
                        thisAbstractProxy.$invalidateUp();
                        return result;
                    }
                    // Immutable types
                    case "number":
                    case "string":
                    case "bigint":
                    case "boolean": {
                        if (wasReactive) {
                            var overwrittenCallbacks = {
                                $thisCallbacks: {},
                                $onCallbacks: {},
                            };
                            overwrittenCallbacks.$onCallbacks[key] = thisAbstractProxy.$reactiveChildren[key].$getCallbacks();
                            thisAbstractProxy.$reactiveChildren[key].$delete();
                            delete thisAbstractProxy.$reactiveChildren[key];
                            thisAbstractProxy.$addCallbacks(overwrittenCallbacks);
                        }
                        if (key in thisAbstractProxy.$postUpdateCallbacksOn) {
                            for (var _e = 0, _f = Object.values(thisAbstractProxy.$postUpdateCallbacksOn[key]); _e < _f.length; _e++) {
                                var f = _f[_e];
                                f(desc.value);
                            }
                        }
                        var result = Reflect.defineProperty(target, key, desc);
                        thisAbstractProxy.$invalidateUp();
                        return result;
                    }
                    default: {
                        throw "Not implemented setting of type " + typeof desc.value;
                    }
                }
            },
            deleteProperty: function (target, key) {
                for (var _i = 0, handlerMods_3 = handlerMods; _i < handlerMods_3.length; _i++) {
                    var handlerMod = handlerMods_3[_i];
                    if (handlerMod.deleteProperty) {
                        for (var _a = 0, _b = handlerMod.deleteProperty; _a < _b.length; _a++) {
                            var getMod = _b[_a];
                            if (getMod[0](target, key)) {
                                return getMod[1](target, key);
                            }
                        }
                    }
                }
                if (key in thisAbstractProxy.$postUpdateCallbacksOn) {
                    for (var _c = 0, _d = Object.values(thisAbstractProxy.$postUpdateCallbacksOn[key]); _c < _d.length; _c++) {
                        var callback = _d[_c];
                        callback(null);
                    }
                }
                if (key in thisAbstractProxy.$reactiveChildren) {
                    var deletedCallbacks = thisAbstractProxy.$reactiveChildren[key].$getCallbacks();
                    thisAbstractProxy.$reactiveChildren[key].$delete();
                    delete thisAbstractProxy.$reactiveChildren[key];
                    var addedCallbacks = {
                        $thisCallbacks: {},
                        $onCallbacks: { key: deletedCallbacks },
                    };
                    thisAbstractProxy.$addCallbacks(addedCallbacks);
                }
                return Reflect.deleteProperty(target, key);
            },
        };
        this.$proxy = new Proxy(this.$internalProxyTarget, handler);
    }
    AbstractProxy.prototype.$addCallbacks = function (callbacks) {
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
    AbstractProxy.prototype.$addPostUpdateCallback = function (name, f) {
        this.$postUpdateCallbacks[name] = f;
    };
    AbstractProxy.prototype.$addPostUpdateCallbackOn = function (on, name, f) {
        if (on in this.$reactiveChildren) {
            this.$reactiveChildren[on].$addPostUpdateCallback(name, f);
            return;
        }
        if (!(on in this.$postUpdateCallbacksOn)) {
            this.$postUpdateCallbacksOn[on] = {};
        }
        this.$postUpdateCallbacksOn[on][name] = f;
    };
    AbstractProxy.prototype.$getCallbacks = function () {
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
    AbstractProxy.prototype.$removePostUpdateCallback = function (name) {
        delete this.$postUpdateCallbacks[name];
    };
    AbstractProxy.prototype.$removePostUpdateCallbackOn = function (name, on) {
        delete this.$postUpdateCallbacksOn[on][name];
    };
    AbstractProxy.prototype.$invalidateDown = function () {
        for (var _i = 0, _a = Object.values(this.$reactiveChildren); _i < _a.length; _i++) {
            var child = _a[_i];
            child.$invalidateDown();
        }
        for (var _b = 0, _c = Object.keys(this.$postUpdateCallbacksOn); _b < _c.length; _b++) {
            var key = _c[_b];
            // This cast works as accessing arrays by string index works
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
    AbstractProxy.prototype.$invalidateUp = function () {
        for (var _i = 0, _a = Object.values(this.$postUpdateCallbacks); _i < _a.length; _i++) {
            var f = _a[_i];
            f(this.$proxy);
        }
        if (this.$parent !== null) {
            this.$parent.$invalidateUp();
        }
    };
    AbstractProxy.prototype.$delete = function () {
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
    AbstractProxy.prototype.$getProxy = function () {
        return this.$proxy;
    };
    AbstractProxy.prototype.$setParent = function (parent) {
        this.$parent = parent;
    };
    AbstractProxy.prototype.$atomicCallback = function (f) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var thisAbstractProxy = this;
        return this.$mutex.acquire().then(function (release) {
            var result = undefined;
            try {
                result = f(thisAbstractProxy.$proxy);
            }
            finally {
                release();
            }
            for (var _i = 0, _a = Object.values(thisAbstractProxy.$postUpdateCallbacks); _i < _a.length; _i++) {
                var f_1 = _a[_i];
                f_1(thisAbstractProxy.$proxy);
            }
            return result;
        });
    };
    AbstractProxy.prototype.$asyncAtomicCallback = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var thisAbstractProxy;
            var _this = this;
            return __generator(this, function (_a) {
                thisAbstractProxy = this;
                return [2 /*return*/, this.$mutex.acquire().then(function (release) { return __awaiter(_this, void 0, void 0, function () {
                        var result, _i, _a, f_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    result = undefined;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, , 3, 4]);
                                    return [4 /*yield*/, f(thisAbstractProxy.$proxy)];
                                case 2:
                                    result = _b.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    release();
                                    return [7 /*endfinally*/];
                                case 4:
                                    for (_i = 0, _a = Object.values(thisAbstractProxy.$postUpdateCallbacks); _i < _a.length; _i++) {
                                        f_2 = _a[_i];
                                        f_2(thisAbstractProxy.$proxy);
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); })];
            });
        });
    };
    return AbstractProxy;
}());
exports.AbstractProxy = AbstractProxy;
//# sourceMappingURL=abstractProxy.js.map