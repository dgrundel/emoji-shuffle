
export const persist = <T extends Object>(t: T, storageKey: string): T => {

    const json = localStorage.getItem(storageKey);
    const values = Object.assign({}, t);
    if (json) {
        try {
            const stored = JSON.parse(json);
            Object.assign(values, stored);
        } catch (e) {
            console.error(`error parsing json for "${storageKey}"`, e);
        }
    }

    const result = {} as T;
    Object.keys(values).forEach(key => {
        Object.defineProperty(result, key, {
            get() {
                return values[key as keyof typeof values];
            },
            set(newValue) {
                values[key as keyof typeof values] = newValue;
                localStorage.setItem(storageKey, JSON.stringify(values));
            },
            enumerable: true,
            configurable: true,
        });
    });

    return result;
};