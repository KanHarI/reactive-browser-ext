declare function addRootWatcher(watched: Record<string, unknown> | Array<unknown>, name: string, f: (x: Record<string, unknown> | Array<unknown> | null) => void): void;
declare function addWatcherOn<T>(watched: Record<string, unknown> | Array<unknown>, on: string, name: string, f: (x: T | null) => void): void;
export { addRootWatcher, addWatcherOn };
//# sourceMappingURL=watcher.d.ts.map