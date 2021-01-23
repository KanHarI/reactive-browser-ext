declare function addRootWatcher(watched: Record<string, unknown> | null, name: string, f: (x: Record<string, unknown> | null) => void): void;
declare function addRecordWatcherOn<T>(watched: Record<string, unknown> | null, on: string, name: string, f: (x: T | null) => void): void;
export { addRootWatcher, addRecordWatcherOn };
//# sourceMappingURL=watcher.d.ts.map