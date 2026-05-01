import { useCallback, useRef } from "react";

/**
 * Returns a debounced version of the callback that will only execute
 * after the specified delay has passed since the last call.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        }) as T,
        [delay]
    );
}

/**
 * Returns a throttled version of the callback that will only execute
 * once per the specified interval, ignoring subsequent calls.
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    interval: number
): T {
    const lastRunRef = useRef<number>(0);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback(
        ((...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastRunRef.current >= interval) {
                lastRunRef.current = now;
                return callbackRef.current(...args);
            }
        }) as T,
        [interval]
    );
}

/**
 * Prevents rapid repeated calls to an async function.
 * Returns early if a call is already in progress.
 */
export function useMutexCallback<T extends (...args: unknown[]) => Promise<unknown>>(
    callback: T
): T {
    const isRunningRef = useRef(false);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback(
        (async (...args: Parameters<T>) => {
            if (isRunningRef.current) {
                return;
            }
            isRunningRef.current = true;
            try {
                return await callbackRef.current(...args);
            } finally {
                isRunningRef.current = false;
            }
        }) as T,
        []
    );
}
