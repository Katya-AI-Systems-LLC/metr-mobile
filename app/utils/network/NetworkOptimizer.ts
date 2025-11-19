// NetworkOptimizer.ts - Network Request Optimization for METR
import NetInfo from '@react-native-community/netinfo';
import {METRPerformance} from '../performance/METRPerformance';
import {METRCache} from '../cache/METRCache';

interface RequestConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  enableCache: boolean;
  cacheTTL: number;
  enableCompression: boolean;
  priority: 'low' | 'normal' | 'high';
}

interface QueuedRequest {
  url: string;
  options: RequestInit;
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
  priority: number;
  retries: number;
}

export class NetworkOptimizer {
  private static instance: NetworkOptimizer;
  private requestQueue: QueuedRequest[] = [];
  private activeRequests: Map<string, Promise<Response>> = new Map();
  private cache: METRCache;
  private performance: METRPerformance;
  private isOnline: boolean = true;
  private maxConcurrentRequests: number = 5;
  private currentRequests: number = 0;

  private constructor() {
    this.cache = METRCache.getInstance();
    this.performance = METRPerformance.getInstance();
    this.setupNetworkMonitoring();
    this.processQueue();
  }

  public static getInstance(): NetworkOptimizer {
    if (!NetworkOptimizer.instance) {
      NetworkOptimizer.instance = new NetworkOptimizer();
    }
    return NetworkOptimizer.instance;
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      
      if (this.isOnline) {
        // Process queued requests when back online
        this.processQueue();
      }
    });
  }

  // Optimized fetch
  public async fetch(
    url: string,
    options: RequestInit = {},
    config: Partial<RequestConfig> = {}
  ): Promise<Response> {
    const requestConfig: RequestConfig = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      enableCache: true,
      cacheTTL: 3600000,
      enableCompression: true,
      priority: 'normal',
      ...config,
    };

    // Check cache first
    if (requestConfig.enableCache && options.method === 'GET') {
      const cached = await this.cache.get<Response>(`network_${url}`);
      if (cached) {
        return cached;
      }
    }

    // Check if online
    if (!this.isOnline) {
      return Promise.reject(new Error('Network offline'));
    }

    // Queue request if at limit
    if (this.currentRequests >= this.maxConcurrentRequests) {
      return this.queueRequest(url, options, requestConfig);
    }

    return this.executeRequest(url, options, requestConfig);
  }

  private async executeRequest(
    url: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<Response> {
    this.currentRequests++;

    try {
      const startTime = performance.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const optimizedOptions: RequestInit = {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Accept-Encoding': 'gzip, deflate',
        },
      };

      const response = await fetch(url, optimizedOptions);
      clearTimeout(timeoutId);

      const duration = performance.now() - startTime;
      this.performance.recordMetric({
        name: 'network_request',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: {
          url,
          method: options.method || 'GET',
          status: String(response.status),
        },
      });

      // Cache successful GET requests
      if (config.enableCache && options.method === 'GET' && response.ok) {
        const clonedResponse = response.clone();
        await this.cache.set(`network_${url}`, clonedResponse, config.cacheTTL);
      }

      this.currentRequests--;
      this.processQueue();

      return response;
    } catch (error) {
      this.currentRequests--;
      
      // Retry logic
      if (config.retries > 0) {
        await this.delay(config.retryDelay);
        config.retries--;
        return this.executeRequest(url, options, config);
      }

      throw error;
    }
  }

  private queueRequest(
    url: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const priority = config.priority === 'high' ? 1 : config.priority === 'normal' ? 2 : 3;
      
      this.requestQueue.push({
        url,
        options,
        resolve,
        reject,
        priority,
        retries: config.retries,
      });

      // Sort by priority
      this.requestQueue.sort((a, b) => a.priority - b.priority);
    });
  }

  private async processQueue(): Promise<void> {
    while (this.currentRequests < this.maxConcurrentRequests && this.requestQueue.length > 0 && this.isOnline) {
      const request = this.requestQueue.shift();
      if (request) {
        this.executeRequest(request.url, request.options, {
          timeout: 30000,
          retries: request.retries,
          retryDelay: 1000,
          enableCache: true,
          cacheTTL: 3600000,
          enableCompression: true,
          priority: 'normal',
        })
          .then(request.resolve)
          .catch(request.reject);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch requests
  public async batchFetch(requests: Array<{url: string; options?: RequestInit}>): Promise<Response[]> {
    return Promise.all(requests.map(req => this.fetch(req.url, req.options)));
  }

  // Prefetch resources
  public async prefetch(urls: string[]): Promise<void> {
    urls.forEach(url => {
      this.fetch(url, {method: 'GET'}, {priority: 'low'}).catch(() => {
        // Ignore prefetch errors
      });
    });
  }

  // Clear network cache
  public async clearCache(): Promise<void> {
    const keys = await this.cache.getStats();
    // Clear network-related cache entries
  }

  // Configure optimizer
  public configure(maxConcurrent: number): void {
    this.maxConcurrentRequests = maxConcurrent;
  }
}

export default NetworkOptimizer;


