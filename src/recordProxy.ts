import { AbstractProxy } from ".";

class RecordProxy extends AbstractProxy {
  constructor(target: Record<string, unknown> | undefined = undefined) {
    if (target === undefined) {
      target = {};
    }
    super(target);
  }
}

export { RecordProxy };
