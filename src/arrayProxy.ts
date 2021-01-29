import { AbstractProxy, HandlerMod } from ".";

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
  constructor() {
    const newEmptyArr: Array<unknown> = [];
    const arrayHandlerMod: HandlerMod = {
      get: [[verifyArrayIndex, verifyArrayIndex]],
      defineProperty: [[verifyArrayIndex, verifyArrayIndex]],
      deleteProperty: [[verifyArrayIndex, verifyArrayIndex]],
    };
    super(newEmptyArr, [arrayHandlerMod]);
  }
}

export { ArrayProxy };
