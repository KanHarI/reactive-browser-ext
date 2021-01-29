// Import order matters as we have circular dependency
import { AbstractProxy, HandlerMod } from "./abstractProxy";
import { ArrayProxy } from "./arrayProxy";
import { RecordProxy } from "./recordProxy";
import { deepCopyRecordToProxy } from "./utils/RecordUtils";
import { addRootWatcher, addWatcherOn } from "./utils/watcher";

export {
  AbstractProxy,
  ArrayProxy,
  HandlerMod,
  RecordProxy,
  deepCopyRecordToProxy,
  addRootWatcher,
  addWatcherOn,
};
