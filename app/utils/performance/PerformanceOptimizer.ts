// PerformanceOptimizer.ts - Advanced Performance Optimization for METR
import {InteractionManager, AppState} from 'react-native';
import {METRPerformance} from './METRPerformance';

interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableMemoryOptimization: boolean;
  enableNetworkOptimization: boolean;
  enableRenderOptimization: boolean;
  maxCacheSize: number; // MB
  imageQuality: number; // 0-100
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: OptimizationConfig;
  private imageCache: Map<string, string> = new Map();
  private componentCache: Map<string, any> = new Map();
  private renderCounts: Map<string, number> = new Map();

  private constructor() {
    this.config = {
      enableImageOptimization: true,
      enableCodeSplitting: true,
      enableMemoryOptimization: true,
      enableNetworkOptimization: true,
      enableRenderOptimization: true,
      maxCacheSize: 100, // 100MB
      imageQuality: 80,
    };

    this.setupOptimizations();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private setupOptimizations(): void {
    // Monitor app state for optimizations
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));

    // Setup interaction manager for deferred operations
    InteractionManager.runAfterInteractions(() => {
      this.optimizeMemory();
    });

    // Periodic optimization
    setInterval(() => {
      this.optimizeMemory();
      this.cleanupCache();
    }, 30000); // Every 30 seconds
  }

  // Image Optimization
  public optimizeImage(url: string, width?: number, height?: number): string {
    if (!this.config.enableImageOptimization) {
      return url;
    }

    const cacheKey = `${url}_${width}_${height}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // In production, use image CDN or optimization service
    const optimizedUrl = `${url}?w=${width || 800}&h=${height || 600}&q=${this.config.imageQuality}`;
    this.imageCache.set(cacheKey, optimizedUrl);

    return optimizedUrl;
  }

  // Component Memoization
  public memoizeComponent<T>(componentId: string, component: T): T {
    if (!this.config.enableRenderOptimization) {
      return component;
    }

    if (this.componentCache.has(componentId)) {
      return this.componentCache.get(componentId);
    }

    this.componentCache.set(componentId, component);
    return component;
  }

  // Track Renders
  public trackRender(componentId: string): void {
    const count = this.renderCounts.get(componentId) || 0;
    this.renderCounts.set(componentId, count + 1);

    // Warn if too many renders
    if (count > 10) {
      console.warn(`Component ${componentId} rendered ${count} times. Consider optimization.`);
    }
  }

  // Memory Optimization
  private optimizeMemory(): void {
    if (!this.config.enableMemoryOptimization) {
      return;
    }

    // Clear old cache entries
    if (this.imageCache.size > 100) {
      const entries = Array.from(this.imageCache.entries());
      const toRemove = entries.slice(0, entries.length - 100);
      toRemove.forEach(([key]) => this.imageCache.delete(key));
    }

    // Clear component cache if needed
    if (this.componentCache.size > 50) {
      const entries = Array.from(this.componentCache.entries());
      const toRemove = entries.slice(0, entries.length - 50);
      toRemove.forEach(([key]) => this.componentCache.delete(key));
    }
  }

  // Cache Cleanup
  private cleanupCache(): void {
    // Clear old image cache
    this.imageCache.clear();
    // Keep component cache for performance
  }

  // Network Optimization
  public optimizeNetworkRequest(url: string, options: RequestInit): RequestInit {
    if (!this.config.enableNetworkOptimization) {
      return options;
    }

    return {
      ...options,
      cache: 'default',
      headers: {
        ...options.headers,
        'Cache-Control': 'max-age=3600',
      },
    };
  }

  // Handle App State Changes
  private handleAppStateChange(nextAppState: string): void {
    if (nextAppState === 'background') {
      // Optimize when app goes to background
      this.optimizeMemory();
      this.cleanupCache();
    } else if (nextAppState === 'active') {
      // Prepare for active state
      this.prepareForActive();
    }
  }

  private prepareForActive(): void {
    // Preload critical resources
    // Warm up caches
  }

  // Get Performance Stats
  public getStats(): {
    imageCacheSize: number;
    componentCacheSize: number;
    renderCounts: Record<string, number>;
  } {
    return {
      imageCacheSize: this.imageCache.size,
      componentCacheSize: this.componentCache.size,
      renderCounts: Object.fromEntries(this.renderCounts),
    };
  }

  // Configure Optimizer
  public configure(config: Partial<OptimizationConfig>): void {
    this.config = {...this.config, ...config};
  }

  // Clear All Caches
  public clearCaches(): void {
    this.imageCache.clear();
    this.componentCache.clear();
    this.renderCounts.clear();
  }
}

export default PerformanceOptimizer;


