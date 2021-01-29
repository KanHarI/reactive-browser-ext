interface Callbacks {
    $thisCallbacks: Record<string, (x: Record<string, unknown> | Array<unknown> | null) => void>;
    $onCallbacks: Record<string | number, Callbacks>;
}
interface ProxyInterface {
    $addCallbacks(callbacks: Callbacks): void;
    $addPostUpdateCallback(name: string, f: (x: Record<string, unknown> | Array<unknown> | null) => void): void;
    $addPostUpdateCallbackOn<T>(on: string | number, name: string, f: (x: T | null) => void): void;
    $asyncAtomicCallback<U>(f: (x: Record<string, unknown>) => Promise<U>): Promise<U>;
    $atomicCallback<U>(f: (x: Record<string, unknown> | Array<unknown>) => U): Promise<U>;
    $delete(): void;
    $getCallbacks(): Callbacks;
    $getProxy(): ProxyInterface;
    $invalidateDown(): void;
    $invalidateUp(): void;
    $removePostUpdateCallback(name: string): void;
    $removePostUpdateCallbackOn(name: string | number, on: string): void;
    $setParent(parent: ProxyInterface): void;
}
export { ProxyInterface, Callbacks };
//# sourceMappingURL=proxyInterface.d.ts.map