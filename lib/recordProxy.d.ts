import { ProxyInterface, Callbacks } from "./proxyInterface";
declare class RecordProxy implements ProxyInterface {
    private $internalProxyTarget;
    private $proxy;
    private $mutex;
    private $postUpdateCallbacks;
    private $postUpdateCallbacksOn;
    private $reactiveChildren;
    private $inactiveCallbacks;
    private $parent;
    constructor();
    $atomicCallback<U>(f: (x: Record<string, unknown>) => U): Promise<U>;
    $asyncAtomicCallback<U>(f: (x: Record<string, unknown>) => Promise<U>): Promise<U>;
    $addPostUpdateCallback(name: string, f: (x: Record<string, unknown> | null) => void): void;
    $addPostUpdateCallbackOn<T>(on: string | number, name: string, f: (x: T | null) => void): void;
    $removePostUpdateCallback(name: string): void;
    $removePostUpdateCallbackOn(name: string, on: string): void;
    $invalidateDown(): void;
    $invalidateUp(): void;
    $getProxy<T>(): T & Record<string, unknown> & ProxyInterface;
    $delete(): void;
    $addCallbacks(callbacks: Callbacks): void;
    $getCallbacks(): Callbacks;
    $setParent(parent: ProxyInterface): void;
}
export { RecordProxy };
//# sourceMappingURL=recordProxy.d.ts.map