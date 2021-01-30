"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordProxy = void 0;
var _1 = require(".");
var RecordProxy = /** @class */ (function (_super) {
    __extends(RecordProxy, _super);
    function RecordProxy(target, handlerMods, deepCopyCallback) {
        if (target === void 0) { target = {}; }
        if (handlerMods === void 0) { handlerMods = []; }
        if (deepCopyCallback === void 0) { deepCopyCallback = _1.deepCopyToReactiveProxy; }
        return _super.call(this, target, handlerMods, deepCopyCallback) || this;
    }
    return RecordProxy;
}(_1.AbstractProxy));
exports.RecordProxy = RecordProxy;
//# sourceMappingURL=recordProxy.js.map