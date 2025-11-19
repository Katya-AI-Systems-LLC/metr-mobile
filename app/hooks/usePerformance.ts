// usePerformance.ts - React Hook for Performance Monitoring
import {useEffect, useRef, useCallback} from 'react';
import {METRPerformance} from '../utils/performance/METRPerformance';
import {METRDevTools} from '../utils/devtools/METRDevTools';

interface UsePerformanceOptions {
  componentName: string;
  trackRenders?: boolean;
  trackInteractions?: boolean;
}

export const usePerformance = (options: UsePerformanceOptions) => {
  const {componentName, trackRenders = true, trackInteractions = true} = options;
  const performance = METRPerformance.getInstance();
  const devTools = METRDevTools.getInstance();
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Track render
  useEffect(() => {
    if (trackRenders) {
      renderCount.current++;
      const renderTime = performance.now() - renderStartTime.current;
      
      if (renderTime > 0) {
        performance.recordMetric({
          name: 'component_render',
          value: renderTime,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {component: componentName},
        });

        devTools.logRender(componentName, renderTime);
      }
    }
  });

  // Track interaction
  const trackInteraction = useCallback(
    async <T,>(name: string, fn: () => Promise<T> | T): Promise<T> => {
      if (!trackInteractions) {
        return await fn();
      }

      const startTime = performance.now();
      renderStartTime.current = startTime;

      try {
        const result = await performance.measure(`${componentName}_${name}`, fn);
        return result;
      } catch (error) {
        performance.recordMetric({
          name: `${componentName}_${name}_error`,
          value: performance.now() - startTime,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {component: componentName, interaction: name},
        });
        throw error;
      }
    },
    [componentName, trackInteractions, performance]
  );

  return {
    trackInteraction,
    renderCount: renderCount.current,
  };
};


