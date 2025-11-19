// METRPerformance.ts - Performance Monitoring and Optimization
import {DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    average: number;
    min: number;
    max: number;
    count: number;
  };
}

export class METRPerformance {
  private static instance: METRPerformance;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private enabled: boolean = true;

  private constructor() {
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): METRPerformance {
    if (!METRPerformance.instance) {
      METRPerformance.instance = new METRPerformance();
    }
    return METRPerformance.instance;
  }

  private setupPerformanceMonitoring(): void {
    // Monitor app startup time
    this.measureStartupTime();

    // Monitor memory usage
    this.monitorMemory();

    // Monitor network requests
    this.monitorNetwork();
  }

  // Measure function execution time
  public async measure<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    if (!this.enabled) {
      return await fn();
    }

    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric({
        name: `${name}_error`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {error: String(error)},
      });

      throw error;
    }
  }

  // Record a custom metric
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.enabled) return;

    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);
    this.metrics.set(metric.name, metrics);

    // Emit event for real-time monitoring
    DeviceEventEmitter.emit('performance_metric', metric);

    // Store metrics periodically
    if (metrics.length % 100 === 0) {
      this.saveMetrics();
    }
  }

  // Get performance report
  public getReport(metricName?: string): PerformanceReport | Map<string, PerformanceReport> {
    if (metricName) {
      return this.getMetricReport(metricName);
    }

    const reports = new Map<string, PerformanceReport>();
    this.metrics.forEach((metrics, name) => {
      reports.set(name, this.getMetricReport(name));
    });

    return reports;
  }

  private getMetricReport(metricName: string): PerformanceReport {
    const metrics = this.metrics.get(metricName) || [];
    const values = metrics.map(m => m.value);

    return {
      metrics,
      summary: {
        average: values.reduce((a, b) => a + b, 0) / values.length || 0,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      },
    };
  }

  // Measure app startup time
  private measureStartupTime(): void {
    const startTime = Date.now();
    
    // Measure when app becomes interactive
    setTimeout(() => {
      const startupTime = Date.now() - startTime;
      this.recordMetric({
        name: 'app_startup_time',
        value: startupTime,
        unit: 'ms',
        timestamp: Date.now(),
      });
    }, 1000);
  }

  // Monitor memory usage
  private monitorMemory(): void {
    setInterval(() => {
      if (global.performance && (global.performance as any).memory) {
        const memory = (global.performance as any).memory;
        this.recordMetric({
          name: 'memory_usage',
          value: memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
        });
      }
    }, 30000); // Every 30 seconds
  }

  // Monitor network requests
  private monitorNetwork(): void {
    // This would integrate with network monitoring
    DeviceEventEmitter.addListener('network_request', (data: any) => {
      this.recordMetric({
        name: 'network_request',
        value: data.duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {
          url: data.url,
          method: data.method,
          status: String(data.status),
        },
      });
    });
  }

  // Save metrics to storage
  private async saveMetrics(): Promise<void> {
    try {
      const metricsData = Array.from(this.metrics.entries()).map(([name, metrics]) => ({
        name,
        metrics,
      }));
      await AsyncStorage.setItem('performance_metrics', JSON.stringify(metricsData));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  // Load metrics from storage
  public async loadMetrics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('performance_metrics');
      if (data) {
        const metricsData = JSON.parse(data);
        metricsData.forEach(({name, metrics}: {name: string; metrics: PerformanceMetric[]}) => {
          this.metrics.set(name, metrics);
        });
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }

  // Clear all metrics
  public clearMetrics(): void {
    this.metrics.clear();
    AsyncStorage.removeItem('performance_metrics');
  }

  // Enable/disable performance monitoring
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // Get performance insights
  public getInsights(): {
    slowestOperations: Array<{name: string; average: number}>;
    fastestOperations: Array<{name: string; average: number}>;
    recommendations: string[];
  } {
    const reports = this.getReport() as Map<string, PerformanceReport>;
    const operations: Array<{name: string; average: number}> = [];

    reports.forEach((report, name) => {
      operations.push({
        name,
        average: report.summary.average,
      });
    });

    const sorted = operations.sort((a, b) => b.average - a.average);
    const slowest = sorted.slice(0, 5);
    const fastest = sorted.slice(-5).reverse();

    const recommendations: string[] = [];
    slowest.forEach(op => {
      if (op.average > 1000) {
        recommendations.push(`Consider optimizing ${op.name} (${op.average.toFixed(2)}ms)`);
      }
    });

    return {
      slowestOperations: slowest,
      fastestOperations: fastest,
      recommendations,
    };
  }
}

export default METRPerformance;


