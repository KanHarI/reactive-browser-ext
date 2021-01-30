import {
  AbstractProxy,
  DeepCopyToReactiveCallback,
  deepCopyToReactiveProxy,
  HandlerMod,
} from ".";

function verifyArrayIndex(
  target: Record<string, unknown>,
  key: string
): boolean {
  const intKey = parseInt(key);
  if (
    key[0] !== "$" &&
    Number.isNaN(intKey) &&
    !Number.isInteger(intKey) &&
    !(key in Array.prototype)
  ) {
    throw "Cannot access property " + key + " of array!";
  }
  return false;
}

class ArrayProxy extends AbstractProxy {
  constructor(
    target: Array<unknown> = [],
    handlerMods: Array<HandlerMod> = [],
    deepCopyCallback: DeepCopyToReactiveCallback = deepCopyToReactiveProxy
  ) {
    // Immutable push
    handlerMods = handlerMods.concat([
      {
        get: [[verifyArrayIndex, verifyArrayIndex]],
        defineProperty: [[verifyArrayIndex, verifyArrayIndex]],
        deleteProperty: [[verifyArrayIndex, verifyArrayIndex]],
      },
    ]);
    super(target, handlerMods, deepCopyCallback);
  }
}

export { ArrayProxy };
