import { AbstractProxy } from "..";
declare type DeepCopyToReactiveCallback = <T>(x: T & (Record<string, unknown> | Array<unknown>)) => AbstractProxy & T & Record<string, unknown>;
declare function deepCopyToReactiveProxy<T>(x: T & (Record<string, unknown> | Array<unknown>)): AbstractProxy & T & Record<string, unknown>;
export { deepCopyToReactiveProxy, DeepCopyToReactiveCallback };
//# sourceMappingURL=reactiveUtils.d.ts.map