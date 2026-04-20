import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    function setValue(value: T) {
        try {
            setStoredValue(value);
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.error(`Failed to write localStorage key "${key}"`);
        }
    }

    return [storedValue, setValue];
}
