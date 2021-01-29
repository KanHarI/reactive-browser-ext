import { Mutex } from "async-mutex";

import { deepCopyRecordToProxy } from ".";

interface Callbacks {
  $thisCallbacks: Record<
    string,
    (x: Record<string, unknown> | Array<unknown> | null) => void
  >;
  $onCallbacks: Record<string | number, Callbacks>;
}

interface HandlerMod {
  get?: Array<
    [
      (target: Record<string, unknown>, key: string) => boolean,
      (target: Record<string, unknown>, key: string) => unknown
    ]
  >;
  defineProperty?: Array<
    [
      (
        target: Record<string, unknown>,
        key: string,
        desc: PropertyDescriptor
      ) => boolean,
      (
        target: Record<string, unknown>,
        key: string,
        desc: PropertyDescriptor
      ) => boolean
    ]
  >;
  deleteProperty?: Array<
    [
      (target: Record<string, unknown>, key: string) => boolean,
      (target: Record<string, unknown>, key: string) => boolean
    ]
  >;
}

class AbstractProxy {
  protected $inactiveCallbacks: Callbacks;
  protected $internalProxyTarget;
  protected $postUpdateCallbacks: Record<
    string,
    (x: Record<string, unknown> | Array<unknown> | null) => void
  >;
  protected $postUpdateCallbacksOn: Record<
    string,
    Record<string, (x: unknown | null) => void>
  >;
  protected $proxy: Record<string, unknown> | Array<unknown>;
  protected $mutex: Mutex;
  protected $reactiveChildren: Record<string, AbstractProxy>;
  protected $parent: AbstractProxy | null;

  constructor(
    target: Record<string, unknown> | Array<unknown>,
    handlerMods: Array<HandlerMod> = [{}]
  ) {
    this.$inactiveCallbacks = { $thisCallbacks: {}, $onCallbacks: {} };
    this.$internalProxyTarget = target;
    this.$postUpdateCallbacks = {};
    this.$postUpdateCallbacksOn = {};
    this.$mutex = new Mutex();
    this.$reactiveChildren = {};
    this.$parent = null;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisAbstractProxy = this;

    const handler: ProxyHandler<Record<string, unknown>> = {
      get: function (target: Record<string, unknown>, key: string): unknown {
        for (const handlerMod of handlerMods) {
          if (handlerMod.get) {
            for (const getMod of handlerMod.get) {
              if (getMod[0](target, key)) {
                return getMod[1](target, key);
              }
            }
          }
        }
        if (key[0] === "$") {
          // Accessing special properties of the proxy
          return Reflect.get(thisAbstractProxy, key);
        }
        if (key in thisAbstractProxy.$reactiveChildren) {
          // Accessing a reactive child - returning its proxy, it will handle whatever comes
          return thisAbstractProxy.$reactiveChildren[key];
        }
        // Accessing a non-reactive (immutable) child - return it's value
        return Reflect.get(thisAbstractProxy.$internalProxyTarget, key);
      },

      defineProperty: function (
        target: Record<string, unknown>,
        key: string,
        desc: PropertyDescriptor
      ): boolean {
        for (const handlerMod of handlerMods) {
          if (handlerMod.defineProperty) {
            for (const getMod of handlerMod.defineProperty) {
              if (getMod[0](target, key, desc)) {
                return getMod[1](target, key, desc);
              }
            }
          }
        }
        if (key[0] === "$") {
          throw "Cannot set properties starting with '$' - they are special properties of the reactive state!";
        }
        const wasReactive = key in thisAbstractProxy.$reactiveChildren;

        switch (typeof desc.value) {
          case "object": {
            // Ignore the null case for now
            const deepCopiedProxy: AbstractProxy = deepCopyRecordToProxy(
              desc.value !== null ? (desc.value as Record<string, unknown>) : {}
            );

            // If object was reactive - copy old callbacks into new object
            if (wasReactive) {
              const callbacks: Callbacks = thisAbstractProxy.$reactiveChildren[
                key
              ].$getCallbacks();

              deepCopiedProxy.$addCallbacks(callbacks);
            }

            // If we have inactive callbacks for current object - register them
            if (key in thisAbstractProxy.$inactiveCallbacks.$onCallbacks) {
              const callbacks =
                thisAbstractProxy.$inactiveCallbacks.$onCallbacks[key];
              deepCopiedProxy.$addCallbacks(callbacks);
            }

            // If we have immutables callbacks - move them to new object
            if (key in thisAbstractProxy.$postUpdateCallbacksOn) {
              for (const callbackName of Object.keys(
                thisAbstractProxy.$postUpdateCallbacksOn[key]
              )) {
                deepCopiedProxy.$addPostUpdateCallback(
                  callbackName,
                  thisAbstractProxy.$postUpdateCallbacksOn[key][callbackName]
                );
              }
              delete thisAbstractProxy.$postUpdateCallbacksOn[key];
            }

            // Invalidate all callbacks recursively
            deepCopiedProxy.$invalidateDown();
            thisAbstractProxy.$reactiveChildren[key] = deepCopiedProxy;
            desc.value = deepCopiedProxy;
            const result = Reflect.defineProperty(target, key, desc);
            thisAbstractProxy.$invalidateUp();
            return result;
          }

          // Immutable types
          case "number":
          case "string":
          case "bigint":
          case "boolean": {
            if (wasReactive) {
              const overwrittenCallbacks: Callbacks = {
                $thisCallbacks: {},
                $onCallbacks: {},
              };
              overwrittenCallbacks.$onCallbacks[
                key
              ] = thisAbstractProxy.$reactiveChildren[key].$getCallbacks();
              thisAbstractProxy.$reactiveChildren[key].$delete();
              delete thisAbstractProxy.$reactiveChildren[key];
              thisAbstractProxy.$addCallbacks(overwrittenCallbacks);
            }
            if (key in thisAbstractProxy.$postUpdateCallbacksOn) {
              for (const f of Object.values(
                thisAbstractProxy.$postUpdateCallbacksOn[key]
              )) {
                f(desc.value);
              }
            }
            const result = Reflect.defineProperty(target, key, desc);
            thisAbstractProxy.$invalidateUp();
            return result;
          }
          default: {
            throw "Not implemented setting of type " + typeof desc.value;
          }
        }
      },
      deleteProperty(target: Record<string, unknown>, key: string): boolean {
        for (const handlerMod of handlerMods) {
          if (handlerMod.deleteProperty) {
            for (const getMod of handlerMod.deleteProperty) {
              if (getMod[0](target, key)) {
                return getMod[1](target, key);
              }
            }
          }
        }
        if (key in thisAbstractProxy.$postUpdateCallbacksOn) {
          for (const callback of Object.values(
            thisAbstractProxy.$postUpdateCallbacksOn[key]
          )) {
            callback(null);
          }
        }
        if (key in thisAbstractProxy.$reactiveChildren) {
          const deletedCallbacks = thisAbstractProxy.$reactiveChildren[
            key
          ].$getCallbacks();
          thisAbstractProxy.$reactiveChildren[key].$delete();
          delete thisAbstractProxy.$reactiveChildren[key];
          const addedCallbacks: Callbacks = {
            $thisCallbacks: {},
            $onCallbacks: { key: deletedCallbacks },
          };
          thisAbstractProxy.$addCallbacks(addedCallbacks);
        }
        return Reflect.deleteProperty(target, key);
      },
    };
    this.$proxy = new Proxy(this.$internalProxyTarget, handler);
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

  $addPostUpdateCallback(
    name: string,
    f: (x: Record<string, unknown> | Array<unknown> | null) => void
  ): void {
    this.$postUpdateCallbacks[name] = f;
  }

  $addPostUpdateCallbackOn<T>(
    on: string | number,
    name: string,
    f: (x: T | null) => void
  ): void {
    if (on in this.$reactiveChildren) {
      this.$reactiveChildren[on].$addPostUpdateCallback(
        name,
        f as (x: Record<string, unknown> | Array<unknown> | null) => void
      );
      return;
    }
    if (!(on in this.$postUpdateCallbacksOn)) {
      this.$postUpdateCallbacksOn[on] = {};
    }
    this.$postUpdateCallbacksOn[on][name] = f as (x: unknown | null) => void;
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

  $removePostUpdateCallback(name: string): void {
    delete this.$postUpdateCallbacks[name];
  }

  $removePostUpdateCallbackOn(name: string, on: string): void {
    delete this.$postUpdateCallbacksOn[on][name];
  }

  $invalidateDown(): void {
    for (const child of Object.values(this.$reactiveChildren)) {
      child.$invalidateDown();
    }
    for (const key of Object.keys(this.$postUpdateCallbacksOn)) {
      // This cast works as accessing arrays by string index works
      const value = (this.$proxy as Record<string, unknown>)[key];
      for (const f of Object.values(this.$postUpdateCallbacksOn[key])) {
        f(value);
      }
    }
    for (const f of Object.values(this.$postUpdateCallbacks)) {
      f(this.$proxy);
    }
  }

  $invalidateUp(): void {
    for (const f of Object.values(this.$postUpdateCallbacks)) {
      f(this.$proxy);
    }
    if (this.$parent !== null) {
      this.$parent.$invalidateUp();
    }
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

  $getProxy<T>(): T & AbstractProxy {
    return (this.$proxy as unknown) as T & AbstractProxy;
  }

  $setParent(parent: AbstractProxy): void {
    this.$parent = parent;
  }

  $atomicCallback<U>(
    f: (x: Record<string, unknown> | Array<unknown> | null) => U
  ): Promise<U> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisAbstractProxy = this;
    return this.$mutex.acquire().then((release) => {
      let result: U | undefined = undefined;
      try {
        result = f(thisAbstractProxy.$proxy);
      } finally {
        release();
      }
      for (const f of Object.values(thisAbstractProxy.$postUpdateCallbacks)) {
        f(thisAbstractProxy.$proxy);
      }
      return result;
    });
  }

  async $asyncAtomicCallback<U>(
    f: (x: Record<string, unknown> | Array<unknown> | null) => Promise<U>
  ): Promise<U> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisAbstractProxy = this;
    return this.$mutex.acquire().then(async (release) => {
      let result: U | undefined = undefined;
      try {
        result = await f(thisAbstractProxy.$proxy);
      } finally {
        release();
      }
      for (const f of Object.values(thisAbstractProxy.$postUpdateCallbacks)) {
        f(thisAbstractProxy.$proxy);
      }
      return result;
    });
  }
}

export { AbstractProxy, HandlerMod };
