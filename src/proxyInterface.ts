interface Callbacks {
  $thisCallbacks: Record<string, (x: Record<string, unknown> | null) => void>;
  $onCallbacks: Record<string | number, Callbacks>;
}

interface ProxyInterface {
  // Trying to perform multiple operations will have them resolved in FIFO resolution order
  $atomicCallback<U>(f: (x: Record<string, unknown>) => U): Promise<U>;
  $asyncAtomicCallback<U>(
    f: (x: Record<string, unknown>) => Promise<U>
  ): Promise<U>;
  $addPostUpdateCallback(
    name: string,
    f: (x: Record<string, unknown> | null) => void
  ): void;
  $addPostUpdateCallbackOn<T>(
    on: string | number,
    name: string,
    f: (x: T | null) => void
  ): void;
  $removePostUpdateCallback(name: string): void;
  $removePostUpdateCallbackOn(name: string | number, on: string): void;
  $invalidateDown(): void;
  $invalidateUp(): void;
  $delete(): void;
  $getProxy(): ProxyInterface;
  $getCallbacks(): Callbacks;
  $addCallbacks(callbacks: Callbacks): void;
  $setParent(parent: ProxyInterface): void;
}

export { ProxyInterface, Callbacks };
