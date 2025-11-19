// HealthMonitor.ts - Application Health Monitoring for METR
import {AppState, DeviceEventEmitter} from 'react-native';
import {METRPerformance} from '../performance/METRPerformance';
import {METRMonitoring} from '../monitoring/METRMonitoring';

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    performance: 'healthy' | 'degraded' | 'unhealthy';
    memory: 'healthy' | 'degraded' | 'unhealthy';
    network: 'healthy' | 'degraded' | 'unhealthy';
    errors: 'healthy' | 'degraded' | 'unhealthy';
  };
  metrics: {
    errorRate: number;
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  timestamp: number;
}

export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthStatus: HealthStatus;
  private performance: METRPerformance;
  private monitoring: METRMonitoring;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.performance = METRPerformance.getInstance();
    this.monitoring = METRMonitoring.getInstance();

    this.healthStatus = {
      overall: 'healthy',
      components: {
        performance: 'healthy',
        memory: 'healthy',
        network: 'healthy',
        errors: 'healthy',
      },
      metrics: {
        errorRate: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      },
      timestamp: Date.now(),
    };

    this.startMonitoring();
  }

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  // Start monitoring
  private startMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, 60000); // Every minute

    // Check on app state changes
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.checkHealth();
      }
    });
  }

  // Check health
  private checkHealth(): void {
    const metrics = this.monitoring.getMetrics();
    const performanceInsights = this.monitoring.getPerformanceInsights();

    // Calculate component health
    const components = {
      performance: this.checkPerformanceHealth(performanceInsights),
      memory: this.checkMemoryHealth(metrics.memory),
      network: this.checkNetworkHealth(metrics.network),
      errors: this.checkErrorHealth(metrics.errors),
    };

    // Calculate overall health
    const overall = this.calculateOverallHealth(components);

    // Update health status
    this.healthStatus = {
      overall,
      components,
      metrics: {
        errorRate: metrics.errors.count / 1000, // Errors per second
        averageResponseTime: metrics.network.averageLatency,
        memoryUsage: metrics.memory.current,
        cpuUsage: 0, // Would need native module
      },
      timestamp: Date.now(),
    };

    // Emit health status
    DeviceEventEmitter.emit('health_status', this.healthStatus);

    // Alert if unhealthy
    if (overall === 'unhealthy') {
      DeviceEventEmitter.emit('health_unhealthy', this.healthStatus);
    }
  }

  // Check performance health
  private checkPerformanceHealth(insights: any): 'healthy' | 'degraded' | 'unhealthy' {
    if (insights.recommendations.length > 5) {
      return 'unhealthy';
    }
    if (insights.recommendations.length > 2) {
      return 'degraded';
    }
    return 'healthy';
  }

  // Check memory health
  private checkMemoryHealth(memory: any): 'healthy' | 'degraded' | 'unhealthy' {
    if (memory.warnings > 10) {
      return 'unhealthy';
    }
    if (memory.warnings > 5) {
      return 'degraded';
    }
    return 'healthy';
  }

  // Check network health
  private checkNetworkHealth(network: any): 'healthy' | 'degraded' | 'unhealthy' {
    const failureRate = network.failures / network.requests;
    if (failureRate > 0.1) {
      return 'unhealthy';
    }
    if (failureRate > 0.05) {
      return 'degraded';
    }
    return 'healthy';
  }

  // Check error health
  private checkErrorHealth(errors: any): 'healthy' | 'degraded' | 'unhealthy' {
    if (errors.count > 100) {
      return 'unhealthy';
    }
    if (errors.count > 50) {
      return 'degraded';
    }
    return 'healthy';
  }

  // Calculate overall health
  private calculateOverallHealth(components: HealthStatus['components']): 'healthy' | 'degraded' | 'unhealthy' {
    const values = Object.values(components);
    if (values.includes('unhealthy')) {
      return 'unhealthy';
    }
    if (values.includes('degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  // Get health status
  public getHealthStatus(): HealthStatus {
    return {...this.healthStatus};
  }

  // Stop monitoring
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default HealthMonitor;


