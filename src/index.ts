import { AbstractProxy } from "./abstractProxy";
import { RecordProxy } from "./recordProxy";
import { ArrayProxy } from "./arrayProxy";
import { deepCopyRecordToProxy } from "./utils/RecordUtils";
import { addRootWatcher, addWatcherOn } from "./utils/watcher";

export {
  AbstractProxy,
  ArrayProxy,
  RecordProxy,
  deepCopyRecordToProxy,
  addRootWatcher,
  addWatcherOn,
};
