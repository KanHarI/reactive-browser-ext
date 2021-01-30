import { AbstractProxy, DeepCopyToReactiveCallback, HandlerMod } from ".";
declare class RecordProxy extends AbstractProxy {
    constructor(target?: Record<string, unknown>, handlerMods?: Array<HandlerMod>, deepCopyCallback?: DeepCopyToReactiveCallback);
}
export { RecordProxy };
//# sourceMappingURL=recordProxy.d.ts.map