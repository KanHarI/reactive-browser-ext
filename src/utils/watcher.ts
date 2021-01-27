import { AbstractProxy } from "..";

// Watched is not enforced to be a ProxyInterface to allow seamless using
function addRootWatcher(
  watched: Record<string, unknown> | Array<unknown>,
  name: string,
  f: (x: Record<string, unknown> | Array<unknown> | null) => void
): void {
  ((watched as unknown) as AbstractProxy).$addPostUpdateCallback(name, f);
}

// Watched is not enforced to be a ProxyInterface to allow seamless using
function addWatcherOn<T>(
  watched: Record<string, unknown> | Array<unknown>,
  on: string,
  name: string,
  f: (x: T | null) => void
): void {
  ((watched as unknown) as AbstractProxy).$addPostUpdateCallbackOn(on, name, f);
}

export { addRootWatcher, addWatcherOn };
