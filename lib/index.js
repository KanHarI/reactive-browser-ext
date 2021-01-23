"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRecordWatcherOn = exports.addRootRecordWatcher = exports.deepCopyRecordToProxy = exports.RecordProxy = void 0;
var recordProxy_1 = require("./recordProxy");
Object.defineProperty(exports, "RecordProxy", { enumerable: true, get: function () { return recordProxy_1.RecordProxy; } });
var RecordUtils_1 = require("./utils/RecordUtils");
Object.defineProperty(exports, "deepCopyRecordToProxy", { enumerable: true, get: function () { return RecordUtils_1.deepCopyRecordToProxy; } });
var watcher_1 = require("./utils/watcher");
Object.defineProperty(exports, "addRootRecordWatcher", { enumerable: true, get: function () { return watcher_1.addRootRecordWatcher; } });
Object.defineProperty(exports, "addRecordWatcherOn", { enumerable: true, get: function () { return watcher_1.addRecordWatcherOn; } });
//# sourceMappingURL=index.js.map