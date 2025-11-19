// METRMonitoring.ts - Advanced Monitoring System for METR
import {AppState, DeviceEventEmitter} from 'react-native';
import {METRPerformance} from '../performance/METRPerformance';
import {METRAnalytics} from '../analytics/METRAnalytics';

interface MonitoringConfig {
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserTracking: boolean;
  enableNetworkMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  enableBatteryMonitoring: boolean;
  sampleRate: number; // 0-1
}

interface MonitoringMetrics {
  performance: {
    appStartTime: number;
    screenLoadTimes: Record<string, number>;
    renderTimes: Record<string, number>;
  };
  errors: {
    count: number;
    recent: Array<{message: string; timestamp: number}>;
  };
  network: {
    requests: number;
    failures: number;
    averageLatency: number;
  };
  memory: {
    current: number;
    peak: number;
    warnings: number;
  };
  battery: {
    level: number;
    state: string;
  };
}

export class METRMonitoring {
  private static instance: METRMonitoring;
  private config: MonitoringConfig;
  private metrics: MonitoringMetrics;
  private performance: METRPerformance;
  private analytics: METRAnalytics;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableUserTracking: true,
      enableNetworkMonitoring: true,
      enableMemoryMonitoring: true,
      enableBatteryMonitoring: true,
      sampleRate: 1.0,
    };

    this.metrics = {
      performance: {
        appStartTime: Date.now(),
        screenLoadTimes: {},
        renderTimes: {},
      },
      errors: {
        count: 0,
        recent: [],
      },
      network: {
        requests: 0,
        failures: 0,
        averageLatency: 0,
      },
      memory: {
        current: 0,
        peak: 0,
        warnings: 0,
      },
      battery: {
        level: 100,
        state: 'unknown',
      },
    };

    this.performance = METRPerformance.getInstance();
    this.analytics = METRAnalytics.getInstance();
    this.setupMonitoring();
  }

  public static getInstance(): METRMonitoring {
    if (!METRMonitoring.instance) {
      METRMonitoring.instance = new METRMonitoring();
    }
    return METRMonitoring.instance;
  }

  private setupMonitoring(): void {
    // Monitor app state
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));

    // Monitor errors
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Monitor performance
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    // Monitor memory
    if (this.config.enableMemoryMonitoring) {
      this.setupMemoryMonitoring();
    }

    // Monitor network
    if (this.config.enableNetworkMonitoring) {
      this.setupNetworkMonitoring();
    }

    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  private setupErrorTracking(): void {
    DeviceEventEmitter.addListener('error_occurred', (error: any) => {
      this.metrics.errors.count++;
      this.metrics.errors.recent.push({
        message: error.message || 'Unknown error',
        timestamp: Date.now(),
      });

      // Keep only last 100 errors
      if (this.metrics.errors.recent.length > 100) {
        this.metrics.errors.recent.shift();
      }

      // Track in analytics
      this.analytics.error(new Error(error.message), {
        category: error.category,
        severity: error.severity,
      });
    });
  }

  private setupPerformanceMonitoring(): void {
    DeviceEventEmitter.addListener('screen_load', (data: {screen: string; loadTime: number}) => {
      this.metrics.performance.screenLoadTimes[data.screen] = data.loadTime;
      
      this.performance.recordMetric({
        name: 'screen_load_time',
        value: data.loadTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {screen: data.screen},
      });
    });

    DeviceEventEmitter.addListener('component_render', (data: {component: string; renderTime: number}) => {
      this.metrics.performance.renderTimes[data.component] = data.renderTime;
    });
  }

  private setupMemoryMonitoring(): void {
    setInterval(() => {
      if (global.performance && (global.performance as any).memory) {
        const memory = (global.performance as any).memory;
        const used = memory.usedJSHeapSize;
        const peak = memory.jsHeapSizeLimit;

        this.metrics.memory.current = used;
        this.metrics.memory.peak = Math.max(this.metrics.memory.peak, used);

        // Warn if memory usage is high
        if (used > peak * 0.8) {
          this.metrics.memory.warnings++;
          console.warn('High memory usage detected:', used / 1024 / 1024, 'MB');
        }
      }
    }, 10000); // Every 10 seconds
  }

  private setupNetworkMonitoring(): void {
    DeviceEventEmitter.addListener('network_request', (data: any) => {
      this.metrics.network.requests++;
      
      if (!data.success) {
        this.metrics.network.failures++;
      }

      // Update average latency
      const latencies = [this.metrics.network.averageLatency, data.latency || 0];
      this.metrics.network.averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    });
  }

  private startPeriodicMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 60000); // Every minute
  }

  private collectMetrics(): void {
    // Collect and send metrics
    const report = this.getMetrics();
    
    // Send to analytics
    this.analytics.track('monitoring_metrics', {
      performance: report.performance,
      errors: report.errors.count,
      network: report.network,
      memory: report.memory,
    });
  }

  private handleAppStateChange(nextAppState: string): void {
    if (nextAppState === 'background') {
      // Send metrics when app goes to background
      this.collectMetrics();
    }
  }

  // Get current metrics
  public getMetrics(): MonitoringMetrics {
    return {...this.metrics};
  }

  // Get performance insights
  public getPerformanceInsights(): {
    slowestScreens: Array<{screen: string; loadTime: number}>;
    slowestComponents: Array<{component: string; renderTime: number}>;
    recommendations: string[];
  } {
    const screens = Object.entries(this.metrics.performance.screenLoadTimes)
      .map(([screen, loadTime]) => ({screen, loadTime}))
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);

    const components = Object.entries(this.metrics.performance.renderTimes)
      .map(([component, renderTime]) => ({component, renderTime}))
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 5);

    const recommendations: string[] = [];
    
    screens.forEach(({screen, loadTime}) => {
      if (loadTime > 1000) {
        recommendations.push(`Optimize ${screen} screen (${loadTime.toFixed(0)}ms)`);
      }
    });

    return {
      slowestScreens: screens,
      slowestComponents: components,
      recommendations,
    };
  }

  // Configure monitoring
  public configure(config: Partial<MonitoringConfig>): void {
    this.config = {...this.config, ...config};
  }

  // Stop monitoring
  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export default METRMonitoring;


