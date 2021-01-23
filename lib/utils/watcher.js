"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWatcherOn = exports.addRootWatcher = void 0;
// Watched is not enforced to be a ProxyInterface to allow seamless using
function addRootWatcher(watched, name, f) {
    watched.$addPostUpdateCallback(name, f);
}
exports.addRootWatcher = addRootWatcher;
// Watched is not enforced to be a ProxyInterface to allow seamless using
function addWatcherOn(watched, on, name, f) {
    watched.$addPostUpdateCallbackOn(on, name, f);
}
exports.addWatcherOn = addWatcherOn;
//# sourceMappingURL=watcher.js.map