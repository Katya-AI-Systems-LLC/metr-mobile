// METRDevTools.ts - Developer Tools for METR
import {DeviceEventEmitter} from 'react-native';
import {METRPerformance} from '../performance/METRPerformance';
import {METRMonitoring} from '../monitoring/METRMonitoring';
import {METRCache} from '../cache/METRCache';

interface DevToolsConfig {
  enablePerformancePanel: boolean;
  enableNetworkPanel: boolean;
  enableCachePanel: boolean;
  enableMonitoringPanel: boolean;
  enableLogging: boolean;
}

export class METRDevTools {
  private static instance: METRDevTools;
  private config: DevToolsConfig;
  private isEnabled: boolean = __DEV__;
  private performance: METRPerformance;
  private monitoring: METRMonitoring;
  private cache: METRCache;

  private constructor() {
    this.config = {
      enablePerformancePanel: true,
      enableNetworkPanel: true,
      enableCachePanel: true,
      enableMonitoringPanel: true,
      enableLogging: true,
    };

    this.performance = METRPerformance.getInstance();
    this.monitoring = METRMonitoring.getInstance();
    this.cache = METRCache.getInstance();

    if (this.isEnabled) {
      this.setupDevTools();
    }
  }

  public static getInstance(): METRDevTools {
    if (!METRDevTools.instance) {
      METRDevTools.instance = new METRDevTools();
    }
    return METRDevTools.instance;
  }

  private setupDevTools(): void {
    // Expose dev tools globally
    if (global.__METR_DEV_TOOLS__) {
      return;
    }

    global.__METR_DEV_TOOLS__ = {
      performance: this.performance,
      monitoring: this.monitoring,
      cache: this.cache,
      getMetrics: () => this.monitoring.getMetrics(),
      getPerformanceInsights: () => this.monitoring.getPerformanceInsights(),
      clearCache: () => this.cache.clear(),
      getStats: () => ({
        performance: this.performance.getInsights(),
        monitoring: this.monitoring.getMetrics(),
        cache: this.cache.getStats(),
      }),
    };

    // Setup console commands
    this.setupConsoleCommands();
  }

  private setupConsoleCommands(): void {
    if (!this.config.enableLogging) {
      return;
    }

    // Performance commands
    (global as any).perf = {
      report: () => console.log(this.performance.getReport()),
      insights: () => console.log(this.performance.getInsights()),
      clear: () => this.performance.clearMetrics(),
    };

    // Monitoring commands
    (global as any).monitor = {
      metrics: () => console.log(this.monitoring.getMetrics()),
      insights: () => console.log(this.monitoring.getPerformanceInsights()),
    };

    // Cache commands
    (global as any).cache = {
      stats: () => console.log(this.cache.getStats()),
      clear: () => this.cache.clear(),
    };
  }

  // Log performance metric
  public logPerformance(name: string, duration: number): void {
    if (!this.isEnabled || !this.config.enableLogging) {
      return;
    }

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  // Log network request
  public logNetwork(url: string, method: string, duration: number, status: number): void {
    if (!this.isEnabled || !this.config.enableLogging) {
      return;
    }

    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    console.log(`[Network] ${emoji} ${method} ${url} - ${duration.toFixed(2)}ms - ${status}`);
  }

  // Log render
  public logRender(component: string, renderTime: number): void {
    if (!this.isEnabled || !this.config.enableLogging) {
      return;
    }

    if (renderTime > 16) {
      console.warn(`[Render] ⚠️ ${component}: ${renderTime.toFixed(2)}ms (slow)`);
    } else {
      console.log(`[Render] ✅ ${component}: ${renderTime.toFixed(2)}ms`);
    }
  }

  // Enable/disable dev tools
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Configure dev tools
  public configure(config: Partial<DevToolsConfig>): void {
    this.config = {...this.config, ...config};
  }
}

export default METRDevTools;


