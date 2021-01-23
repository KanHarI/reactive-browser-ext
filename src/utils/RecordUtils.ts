import { RecordProxy } from "../recordProxy";

function deepCopyRecordToProxy<T>(
  x: T & Record<string, unknown>
): RecordProxy & T & Record<string, unknown> {
  const newObj = new RecordProxy().$getProxy();
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
    newObj[key] = x[key];
  }
  return (newObj as unknown) as RecordProxy & T & Record<string, unknown>;
}

export { deepCopyRecordToProxy };
