import { AbstractProxy } from "..";
declare function deepCopyRecordToProxy<T>(x: T & (Record<string, unknown> | Array<unknown>)): AbstractProxy & T & Record<string, unknown>;
export { deepCopyRecordToProxy };
//# sourceMappingURL=RecordUtils.d.ts.map