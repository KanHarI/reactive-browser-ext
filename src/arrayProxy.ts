import { AbstractProxy } from ".";

class ArrayProxy extends AbstractProxy {
  constructor() {
    const newEmptyArr: Array<unknown> = [];
    super(newEmptyArr);
  }
}

export { ArrayProxy };
