import {
  AbstractProxy,
  DeepCopyToReactiveCallback,
  deepCopyToReactiveProxy,
  HandlerMod,
} from ".";

class RecordProxy extends AbstractProxy {
  constructor(
    target: Record<string, unknown> = {},
    handlerMods: Array<HandlerMod> = [],
    deepCopyCallback: DeepCopyToReactiveCallback = deepCopyToReactiveProxy
  ) {
    super(target, handlerMods, deepCopyCallback);
  }
}

export { RecordProxy };
