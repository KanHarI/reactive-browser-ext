"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRecordWatcherOn = exports.addRootWatcher = void 0;
// Watched is not enforced to be a ProxyInterface to allow seamless using
function addRootWatcher(watched, name, f) {
    watched.$addPostUpdateCallback(name, f);
}
exports.addRootWatcher = addRootWatcher;
// Watched is not enforced to be a ProxyInterface to allow seamless using
function addRecordWatcherOn(watched, on, name, f) {
    watched.$addPostUpdateCallbackOn(on, name, f);
}
exports.addRecordWatcherOn = addRecordWatcherOn;
//# sourceMappingURL=watcher.js.map