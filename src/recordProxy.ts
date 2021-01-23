import { Mutex } from "async-mutex";

import { ProxyInterface, Callbacks } from "./proxyInterface";
import { deepCopyRecordToProxy } from "./utils/RecordUtils";

class RecordProxy implements ProxyInterface {
  private $internalProxyTarget: Record<string, unknown>;
  private $proxy: Record<string, unknown>;
  private $mutex: Mutex;
  private $postUpdateCallbacks: Record<
    string,
    (x: Record<string, unknown> | null) => void
  >;
  private $postUpdateCallbacksOn: Record<
    string,
    Record<string, (x: unknown | null) => void>
  >;
  private $reactiveChildren: Record<string, ProxyInterface>;
  private $inactiveCallbacks: Callbacks;

  constructor() {
    this.$mutex = new Mutex();
    this.$internalProxyTarget = {};
    this.$reactiveChildren = {};
    this.$inactiveCallbacks = { $thisCallbacks: {}, $onCallbacks: {} };

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRecordProxy = this;
    const handler: ProxyHandler<Record<string, unknown>> = {
      get: function (target: Record<string, unknown>, key: string): unknown {
        if (key[0] === "$") {
          // Accessing special properties of the proxy
          return Reflect.get(thisRecordProxy, key);
        }
        if (key in thisRecordProxy.$reactiveChildren) {
          // Accessing a reactive child - returning its proxy, it will handle whatever comes
          return thisRecordProxy.$reactiveChildren[key];
        }
        // Accessing a non-reactive (immutable) child - return it's value
        return Reflect.get(thisRecordProxy.$internalProxyTarget, key);
      },

      defineProperty: function (
        target: Record<string, unknown>,
        key: string,
        desc: Record<string, unknown>
      ): boolean {
        if (key[0] === "$") {
          throw "Cannot set properties starting with '$' - they are special properties of the reactive state!";
        }
        const wasReactive = key in thisRecordProxy.$reactiveChildren;

        switch (typeof desc.value) {
          case "object": {
            // Ignore the null case for now
            const deepCopiedProxy: RecordProxy &
              Record<string, unknown> = deepCopyRecordToProxy(
              desc.value !== null ? (desc.value as Record<string, unknown>) : {}
            );

            // If object was reactive - copy old callbacks into new object
            if (wasReactive) {
              const callbacks: Callbacks = thisRecordProxy.$reactiveChildren[
                key
              ].$getCallbacks();

              deepCopiedProxy.$addCallbacks(callbacks);
            }

            // If we have inactive callbacks for current object - register them
            if (key in thisRecordProxy.$inactiveCallbacks.$onCallbacks) {
              const callbacks =
                thisRecordProxy.$inactiveCallbacks.$onCallbacks[key];
              deepCopiedProxy.$addCallbacks(callbacks);
            }

            // If we have immutables callbacks - move them to new object
            if (key in thisRecordProxy.$postUpdateCallbacksOn) {
              for (const callbackName of Object.keys(
                thisRecordProxy.$postUpdateCallbacksOn[key]
              )) {
                deepCopiedProxy.$addPostUpdateCallback(
                  callbackName,
                  thisRecordProxy.$postUpdateCallbacksOn[key][callbackName]
                );
              }
            }

            // Invalidate all callbacks recursively
            deepCopiedProxy.$invalidate();
            return Reflect.defineProperty(target, key, desc);
          }
          default: {
            throw "Not implemented setting of type " + typeof desc.value;
          }
        }
      },
      deleteProperty(target: Record<string, unknown>, key: string): boolean {
        if (key in thisRecordProxy.$postUpdateCallbacksOn) {
          for (const callback of Object.values(
            thisRecordProxy.$postUpdateCallbacksOn[key]
          )) {
            callback(null);
          }
        }
        if (key in thisRecordProxy.$reactiveChildren) {
          const deletedCallbacks = thisRecordProxy.$reactiveChildren[
            key
          ].$getCallbacks();
          thisRecordProxy.$reactiveChildren[key].$delete();
          delete thisRecordProxy.$reactiveChildren[key];
          const addedCallbacks: Callbacks = {
            $thisCallbacks: {},
            $onCallbacks: { key: deletedCallbacks },
          };
          thisRecordProxy.$addCallbacks(addedCallbacks);
        }
        return Reflect.deleteProperty(target, key);
      },
    };
    this.$proxy = new Proxy(this.$internalProxyTarget, handler);
    this.$postUpdateCallbacks = {};
    this.$postUpdateCallbacksOn = {};
  }

  async $atomicCallback<U>(f: (x: Record<string, unknown>) => U): Promise<U> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRecordProxy = this;
    return this.$mutex.acquire().then((release) => {
      let result: U | undefined = undefined;
      try {
        result = f(thisRecordProxy.$proxy);
      } finally {
        release();
      }
      for (const f of Object.values(thisRecordProxy.$postUpdateCallbacks)) {
        f(thisRecordProxy.$proxy);
      }
      return result;
    });
  }

  async $asyncAtomicCallback<U>(
    f: (x: Record<string, unknown>) => Promise<U>
  ): Promise<U> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRecordProxy = this;
    return this.$mutex.acquire().then(async (release) => {
      let result: U | undefined = undefined;
      try {
        result = await f(thisRecordProxy.$proxy);
      } finally {
        release();
      }
      for (const f of Object.values(thisRecordProxy.$postUpdateCallbacks)) {
        f(thisRecordProxy.$proxy);
      }
      return result;
    });
  }

  $addPostUpdateCallback(
    name: string,
    f: (x: Record<string, unknown> | null) => void
  ): void {
    this.$postUpdateCallbacks[name] = f;
  }

  $addPostUpdateCallbackOn(
    name: string,
    f: (x: unknown) => void,
    on: string | number
  ): void {
    if (!(on in this.$postUpdateCallbacksOn)) {
      this.$postUpdateCallbacksOn[on] = {};
    }
    this.$postUpdateCallbacksOn[on][name] = f;
  }

  $removePostUpdateCallback(name: string): void {
    delete this.$postUpdateCallbacks[name];
  }

  $removePostUpdateCallbackOn(name: string, on: string): void {
    delete this.$postUpdateCallbacksOn[on][name];
  }

  $invalidate(): void {
    for (const child of Object.values(this.$reactiveChildren)) {
      child.$invalidate();
    }
    for (const key of Object.keys(this.$postUpdateCallbacksOn)) {
      const value = this.$proxy[key];
      for (const f of Object.values(this.$postUpdateCallbacksOn[key])) {
        f(value);
      }
    }
    for (const f of Object.values(this.$postUpdateCallbacks)) {
      f(this.$proxy);
    }
  }

  $getProxy<T>(): T & Record<string, unknown> & ProxyInterface {
    return (this.$proxy as unknown) as T &
      Record<string, unknown> &
      ProxyInterface;
  }

  $delete(): void {
    for (const child of Object.values(this.$reactiveChildren)) {
      child.$delete();
    }
    for (const key of Object.keys(this.$postUpdateCallbacksOn)) {
      for (const f of Object.values(this.$postUpdateCallbacksOn[key])) {
        f(null);
      }
    }
    for (const f of Object.values(this.$postUpdateCallbacks)) {
      f(null);
    }
  }

  $addCallbacks(callbacks: Callbacks): void {
    for (const callbackName of Object.keys(callbacks.$thisCallbacks)) {
      this.$addPostUpdateCallback(
        callbackName,
        callbacks.$thisCallbacks[callbackName]
      );
    }
    for (const key of Object.keys(callbacks.$onCallbacks)) {
      if (key in this.$reactiveChildren) {
        this.$reactiveChildren[key].$addCallbacks(callbacks.$onCallbacks[key]);
      } else {
        if (!(key in this.$postUpdateCallbacksOn)) {
          this.$postUpdateCallbacksOn = {};
        }
        for (const callbackName of Object.keys(
          callbacks.$onCallbacks[key].$thisCallbacks
        )) {
          this.$postUpdateCallbacksOn[key][callbackName] = callbacks
            .$onCallbacks[key].$thisCallbacks[callbackName] as (
            x: unknown | null
          ) => void;
        }
        for (const callbackKey of Object.keys(
          callbacks.$onCallbacks[key].$onCallbacks
        )) {
          if (!(key in this.$inactiveCallbacks.$onCallbacks)) {
            this.$inactiveCallbacks.$onCallbacks[key] = {
              $thisCallbacks: {},
              $onCallbacks: {},
            };
          }
          this.$inactiveCallbacks.$onCallbacks[key].$onCallbacks[callbackKey] =
            callbacks.$onCallbacks[key].$onCallbacks[callbackKey];
        }
      }
    }
  }

  $getCallbacks(): Callbacks {
    const callbacks: Callbacks = { $thisCallbacks: {}, $onCallbacks: {} };
    for (const callbackName of Object.keys(this.$postUpdateCallbacks)) {
      callbacks.$thisCallbacks[callbackName] = this.$postUpdateCallbacks[
        callbackName
      ];
    }
    for (const key of Object.keys(this.$reactiveChildren)) {
      callbacks.$onCallbacks[key] = this.$reactiveChildren[key].$getCallbacks();
    }
    for (const key of Object.keys(this.$postUpdateCallbacksOn)) {
      if (!(key in callbacks.$onCallbacks)) {
        callbacks.$onCallbacks[key] = { $thisCallbacks: {}, $onCallbacks: {} };
      }
      for (const callbackName of Object.keys(
        this.$postUpdateCallbacksOn[key]
      )) {
        callbacks.$onCallbacks[key].$thisCallbacks[
          callbackName
        ] = this.$postUpdateCallbacksOn[key][callbackName];
      }
    }
    return callbacks;
  }
}

export { RecordProxy };
