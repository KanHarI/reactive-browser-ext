import { Mutex } from "async-mutex";
interface Callbacks {
    $thisCallbacks: Record<string, (x: Record<string, unknown> | Array<unknown> | null) => void>;
    $onCallbacks: Record<string | number, Callbacks>;
}
interface HandlerMod {
    get?: Array<[
        (target: Record<string, unknown>, key: string) => boolean,
        (target: Record<string, unknown>, key: string) => unknown
    ]>;
    defineProperty?: Array<[
        (target: Record<string, unknown>, key: string, desc: PropertyDescriptor) => boolean,
        (target: Record<string, unknown>, key: string, desc: PropertyDescriptor) => boolean
    ]>;
    deleteProperty?: Array<[
        (target: Record<string, unknown>, key: string) => boolean,
        (target: Record<string, unknown>, key: string) => boolean
    ]>;
}
declare class AbstractProxy {
    protected $inactiveCallbacks: Callbacks;
    protected $internalProxyTarget: Record<string, unknown> | unknown[];
    protected $postUpdateCallbacks: Record<string, (x: Record<string, unknown> | Array<unknown> | null) => void>;
    protected $postUpdateCallbacksOn: Record<string, Record<string, (x: unknown | null) => void>>;
    protected $proxy: Record<string, unknown> | Array<unknown>;
    protected $mutex: Mutex;
    protected $reactiveChildren: Record<string, AbstractProxy>;
    protected $parent: AbstractProxy | null;
    constructor(target: Record<string, unknown> | Array<unknown>, handlerMods?: Array<HandlerMod>);
    $addCallbacks(callbacks: Callbacks): void;
    $addPostUpdateCallback(name: string, f: (x: Record<string, unknown> | Array<unknown> | null) => void): void;
    $addPostUpdateCallbackOn<T>(on: string | number, name: string, f: (x: T | null) => void): void;
    $getCallbacks(): Callbacks;
    $removePostUpdateCallback(name: string): void;
    $removePostUpdateCallbackOn(name: string, on: string): void;
    $invalidateDown(): void;
    $invalidateUp(): void;
    $delete(): void;
    $getProxy<T>(): T & AbstractProxy;
    $setParent(parent: AbstractProxy): void;
    $atomicCallback<U>(f: (x: Record<string, unknown> | Array<unknown> | null) => U): Promise<U>;
    $asyncAtomicCallback<U>(f: (x: Record<string, unknown> | Array<unknown> | null) => Promise<U>): Promise<U>;
}
export { AbstractProxy, HandlerMod };
//# sourceMappingURL=abstractProxy.d.ts.map