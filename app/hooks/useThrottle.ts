// useThrottle.ts - React Hook for Throttling
import {useRef, useCallback} from 'react';

export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  const inThrottle = useRef<boolean>(false);
  const lastFunc = useRef<NodeJS.Timeout | null>(null);
  const lastRan = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (!inThrottle.current) {
        func(...args);
        lastRan.current = Date.now();
        inThrottle.current = true;
      } else {
        if (lastFunc.current) {
          clearTimeout(lastFunc.current);
        }
        lastFunc.current = setTimeout(() => {
          if (Date.now() - lastRan.current >= limit) {
            func(...args);
            lastRan.current = Date.now();
          }
        }, limit - (Date.now() - lastRan.current));
      }
    }) as T,
    [func, limit]
  );
};


