"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWatcherOn = exports.addRootWatcher = exports.deepCopyRecordToProxy = exports.RecordProxy = exports.ArrayProxy = exports.AbstractProxy = void 0;
// Import order matters as we have circular dependency
var abstractProxy_1 = require("./abstractProxy");
Object.defineProperty(exports, "AbstractProxy", { enumerable: true, get: function () { return abstractProxy_1.AbstractProxy; } });
var arrayProxy_1 = require("./arrayProxy");
Object.defineProperty(exports, "ArrayProxy", { enumerable: true, get: function () { return arrayProxy_1.ArrayProxy; } });
var recordProxy_1 = require("./recordProxy");
Object.defineProperty(exports, "RecordProxy", { enumerable: true, get: function () { return recordProxy_1.RecordProxy; } });
var RecordUtils_1 = require("./utils/RecordUtils");
Object.defineProperty(exports, "deepCopyRecordToProxy", { enumerable: true, get: function () { return RecordUtils_1.deepCopyRecordToProxy; } });
var watcher_1 = require("./utils/watcher");
Object.defineProperty(exports, "addRootWatcher", { enumerable: true, get: function () { return watcher_1.addRootWatcher; } });
Object.defineProperty(exports, "addWatcherOn", { enumerable: true, get: function () { return watcher_1.addWatcherOn; } });
//# sourceMappingURL=index.js.map