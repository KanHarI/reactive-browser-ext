"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWatcherOn = exports.addRootWatcher = exports.deepCopyRecordToProxy = exports.RecordProxy = void 0;
var recordProxy_1 = require("./recordProxy");
Object.defineProperty(exports, "RecordProxy", { enumerable: true, get: function () { return recordProxy_1.RecordProxy; } });
var RecordUtils_1 = require("./utils/RecordUtils");
Object.defineProperty(exports, "deepCopyRecordToProxy", { enumerable: true, get: function () { return RecordUtils_1.deepCopyRecordToProxy; } });
var watcher_1 = require("./utils/watcher");
Object.defineProperty(exports, "addRootWatcher", { enumerable: true, get: function () { return watcher_1.addRootWatcher; } });
Object.defineProperty(exports, "addWatcherOn", { enumerable: true, get: function () { return watcher_1.addWatcherOn; } });
//# sourceMappingURL=index.js.map