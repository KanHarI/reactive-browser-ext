import { AbstractProxy } from "..";
import { RecordProxy } from "..";
import { ArrayProxy } from "..";

function deepCopyRecordToProxy<T>(
  x: T & (Record<string, unknown> | Array<unknown>)
): AbstractProxy & T & Record<string, unknown> {
  let newObj: Record<string, unknown> | null = null;
  if (Array.isArray(x)) {
    newObj = new ArrayProxy().$getProxy<Record<string, unknown>>();
  } else {
    // This is definently lying - we get back an array. But this type checks
    // and works unlike the alternative...
    newObj = new RecordProxy().$getProxy<Record<string, unknown>>();
  }

  let isReactive = false;
  for (const key of Object.keys(x)) {
    if (key[0] === "$") {
      isReactive = true;
    }
  }
  if (isReactive) {
    // TODO: Implement reading internal state and performing a deep copy
    throw "Not implemented yet!";
  }
  for (const key of Object.keys(x)) {
    newObj[key] = (x as Record<string, unknown>)[key];
  }
  return (newObj as unknown) as AbstractProxy & T & Record<string, unknown>;
}

export { deepCopyRecordToProxy };
