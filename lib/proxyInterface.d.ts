interface Callbacks {
    $thisCallbacks: Record<string, (x: Record<string, unknown> | null) => void>;
    $onCallbacks: Record<string | number, Callbacks>;
}
interface ProxyInterface {
    $atomicCallback<U>(f: (x: Record<string, unknown>) => U): Promise<U>;
    $asyncAtomicCallback<U>(f: (x: Record<string, unknown>) => Promise<U>): Promise<U>;
    $addPostUpdateCallback(name: string, f: (x: Record<string, unknown> | null) => void): void;
    $addPostUpdateCallbackOn(name: string, f: (x: unknown | null) => void, on: string | number): void;
    $removePostUpdateCallback(name: string): void;
    $removePostUpdateCallbackOn(name: string | number, on: string): void;
    $invalidate(): void;
    $delete(): void;
    $getProxy(): ProxyInterface;
    $getCallbacks(): Callbacks;
    $addCallbacks(callbacks: Callbacks): void;
}
export { ProxyInterface, Callbacks };
//# sourceMappingURL=proxyInterface.d.ts.map