import { useState, useEffect } from 'react';

// This hook receives two parameters:
// storageKey: This is the name of our storage that gets used when we retrieve/save our persistent data.
// initialState: This is our default value, but only if the store doesn't exist, otherwise it gets overwritten by the store.
export default <T>(storageKey: string, initialState: T): [T, (arg0: T) => void] => {
    const [state, setInternalState] = useState<T>(initialState);

    useEffect(() => {
        const storageInBrowser = localStorage.getItem(storageKey);
        try {
            if (storageInBrowser !== null) {
                const data: T = JSON.parse(storageInBrowser) as T;
                setInternalState(data);
            }
        } catch (e) {
            // probabilmente avrò qualche valore invalido di json, voglio tenere solo questo valore con questa key
            localStorage.removeItem(storageKey);
        }
        localStorage.setItem(storageKey, JSON.stringify(state));
    }, []);

    const setState = (newState: T): void => {
        localStorage.setItem(storageKey, JSON.stringify(newState));
        setInternalState(newState);
    };

    return [state, setState];
};
