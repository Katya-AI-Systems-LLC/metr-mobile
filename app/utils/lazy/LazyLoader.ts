// LazyLoader.ts - Lazy Loading System for METR
import {ComponentType, lazy, LazyExoticComponent} from 'react';
import {METRPerformance} from '../performance/METRPerformance';

interface LazyLoadConfig {
  preload: boolean;
  timeout: number;
  fallback?: ComponentType<any>;
}

export class LazyLoader {
  private static instance: LazyLoader;
  private loadedComponents: Map<string, boolean> = new Map();
  private performance: METRPerformance;

  private constructor() {
    this.performance = METRPerformance.getInstance();
  }

  public static getInstance(): LazyLoader {
    if (!LazyLoader.instance) {
      LazyLoader.instance = new LazyLoader();
    }
    return LazyLoader.instance;
  }

  // Create lazy component
  public createLazyComponent<T extends ComponentType<any>>(
    name: string,
    importFn: () => Promise<{default: T}>,
    config: Partial<LazyLoadConfig> = {}
  ): LazyExoticComponent<T> {
    const defaultConfig: LazyLoadConfig = {
      preload: false,
      timeout: 10000,
      ...config,
    };

    const LazyComponent = lazy(() => {
      const startTime = performance.now();
      
      return importFn().then(module => {
        const loadTime = performance.now() - startTime;
        
        this.performance.recordMetric({
          name: 'lazy_load',
          value: loadTime,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {component: name},
        });

        this.loadedComponents.set(name, true);
        return module;
      });
    });

    // Preload if configured
    if (defaultConfig.preload) {
      this.preloadComponent(name, importFn);
    }

    return LazyComponent;
  }

  // Preload component
  public async preloadComponent(
    name: string,
    importFn: () => Promise<any>
  ): Promise<void> {
    if (this.loadedComponents.has(name)) {
      return;
    }

    try {
      await importFn();
      this.loadedComponents.set(name, true);
    } catch (error) {
      console.error(`Failed to preload component ${name}:`, error);
    }
  }

  // Check if component is loaded
  public isLoaded(name: string): boolean {
    return this.loadedComponents.has(name);
  }

  // Get loaded components
  public getLoadedComponents(): string[] {
    return Array.from(this.loadedComponents.keys());
  }
}

export default LazyLoader;


