// Store the callback functions in a registry to be called later, because we can't dispatch a function (as they are not serializable)
class CallbackRegistry {
    private static instance: CallbackRegistry;
    private callbacks: { [key: string]: () => void } = {};

    private constructor() {}

    public static getInstance(): CallbackRegistry {
        if (!CallbackRegistry.instance) {
            CallbackRegistry.instance = new CallbackRegistry();
        }
        return CallbackRegistry.instance;
    }

    public setCallback(key: string, callback: () => void) {
        this.callbacks[key] = callback;
    }

    public getCallback(key: string): (() => void) | undefined {
        return this.callbacks[key];
    }

    public clearCallback(key: string) {
        delete this.callbacks[key];
    }
}

export default CallbackRegistry.getInstance();
