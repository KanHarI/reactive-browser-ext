// Import order matters as we have circular dependency
import { AbstractProxy, HandlerMod } from "./abstractProxy";
import { ArrayProxy } from "./arrayProxy";
import { RecordProxy } from "./recordProxy";
import {
  DeepCopyToReactiveCallback,
  deepCopyToReactiveProxy,
} from "./utils/reactiveUtils";
import { addRootWatcher, addWatcherOn } from "./utils/watcher";

export {
  AbstractProxy,
  ArrayProxy,
  DeepCopyToReactiveCallback,
  HandlerMod,
  RecordProxy,
  deepCopyToReactiveProxy,
  addRootWatcher,
  addWatcherOn,
};
