import { ProxyInterface } from "../proxyInterface";

// Watched is not enforced to be a ProxyInterface to allow seamless using
function addRootRecordWatcher(
  watched: Record<string, unknown> | null,
  name: string,
  f: (x: Record<string, unknown> | null) => void
): void {
  ((watched as unknown) as ProxyInterface).$addPostUpdateCallback(name, f);
}

// Watched is not enforced to be a ProxyInterface to allow seamless using
function addRecordWatcherOn<T>(
  watched: Record<string, unknown> | null,
  on: string,
  name: string,
  f: (x: T | null) => void
): void {
  ((watched as unknown) as ProxyInterface).$addPostUpdateCallbackOn(
    on,
    name,
    f
  );
}

export { addRootRecordWatcher, addRecordWatcherOn };
