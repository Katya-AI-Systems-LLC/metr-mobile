// useMemoizedCallback.ts - React Hook for Memoized Callbacks
import {useCallback, useRef} from 'react';

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const callbackRef = useRef(callback);

  // Update callback ref when deps change
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    deps
  );
};


