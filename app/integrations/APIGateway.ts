// APIGateway.ts - Universal API Gateway for METR
import AsyncStorage from '@react-native-async-storage/async-storage';

interface APIEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  authentication: {
    type: 'none' | 'apiKey' | 'bearer' | 'oauth2' | 'basic';
    credentials?: any;
  };
  headers: Record<string, string>;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    retryableStatuses: number[];
  };
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}

export class APIGateway {
  private static instance: APIGateway;
  private endpoints: Map<string, APIEndpoint>;
  private cache: Map<string, {data: any; expiry: number}>;
  private metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
  };

  private constructor() {
    this.endpoints = new Map();
    this.cache = new Map();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
    };
    this.loadDefaultIntegrations();
  }

  public static getInstance(): APIGateway {
    if (!APIGateway.instance) {
      APIGateway.instance = new APIGateway();
    }
    return APIGateway.instance;
  }

  private loadDefaultIntegrations() {
    // Slack Integration
    this.addEndpoint({
      id: 'slack',
      name: 'Slack API',
      baseUrl: 'https://slack.com/api',
      authentication: {type: 'bearer'},
      headers: {'Content-Type': 'application/json'},
      timeout: 10000,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [429, 500, 502, 503, 504],
      },
    });

    // GitHub Integration
    this.addEndpoint({
      id: 'github',
      name: 'GitHub API',
      baseUrl: 'https://api.github.com',
      authentication: {type: 'bearer'},
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      timeout: 15000,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [429, 500, 502, 503, 504],
      },
    });

    // OpenAI Integration
    this.addEndpoint({
      id: 'openai',
      name: 'OpenAI API',
      baseUrl: 'https://api.openai.com/v1',
      authentication: {type: 'bearer'},
      headers: {'Content-Type': 'application/json'},
      timeout: 30000,
      retryPolicy: {
        maxRetries: 2,
        retryDelay: 2000,
        retryableStatuses: [429, 500, 502, 503, 504],
      },
    });

    // Jira Integration
    this.addEndpoint({
      id: 'jira',
      name: 'Jira API',
      baseUrl: 'https://your-domain.atlassian.net/rest/api/3',
      authentication: {type: 'basic'},
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [429, 500, 502, 503, 504],
      },
    });

    // Notion Integration
    this.addEndpoint({
      id: 'notion',
      name: 'Notion API',
      baseUrl: 'https://api.notion.com/v1',
      authentication: {type: 'bearer'},
      headers: {
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [429, 500, 502, 503, 504],
      },
    });

    // Trello Integration
    this.addEndpoint({
      id: 'trello',
      name: 'Trello API',
      baseUrl: 'https://api.trello.com/1',
      authentication: {type: 'apiKey'},
      headers: {'Accept': 'application/json'},
      timeout: 10000,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [429, 500, 502, 503, 504],
      },
    });
  }

  public addEndpoint(endpoint: APIEndpoint): void {
    this.endpoints.set(endpoint.id, endpoint);
    this.saveEndpoints();
  }

  public removeEndpoint(id: string): void {
    this.endpoints.delete(id);
    this.saveEndpoints();
  }

  private async saveEndpoints() {
    const endpoints = Array.from(this.endpoints.values());
    await AsyncStorage.setItem('api_endpoints', JSON.stringify(endpoints));
  }

  public async request<T = any>(
    endpointId: string,
    config: RequestConfig
  ): Promise<T> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    // Check cache
    const cacheKey = `${endpointId}-${config.method}-${config.path}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();
    
    try {
      // Build URL
      const url = this.buildUrl(endpoint.baseUrl, config.path, config.params);
      
      // Build headers
      const headers = {
        ...endpoint.headers,
        ...config.headers,
        ...(await this.getAuthHeaders(endpoint)),
      };

      // Execute request with retry logic
      const response = await this.executeWithRetry(
        url,
        {
          method: config.method,
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
        },
        endpoint.retryPolicy
      );

      const data = await response.json();
      
      // Update metrics
      this.updateMetrics(true, Date.now() - startTime);
      
      // Cache if GET request
      if (config.method === 'GET') {
        this.addToCache(cacheKey, data, 5 * 60 * 1000); // 5 min cache
      }

      return data;
    } catch (error) {
      this.updateMetrics(false, Date.now() - startTime);
      throw error;
    }
  }

  private buildUrl(baseUrl: string, path: string, params?: Record<string, any>): string {
    let url = `${baseUrl}${path}`;
    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      url += `?${queryString}`;
    }
    return url;
  }

  private async getAuthHeaders(endpoint: APIEndpoint): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    
    switch (endpoint.authentication.type) {
      case 'bearer':
        const token = await AsyncStorage.getItem(`${endpoint.id}_token`);
        if (token) headers['Authorization'] = `Bearer ${token}`;
        break;
      case 'apiKey':
        const apiKey = await AsyncStorage.getItem(`${endpoint.id}_apiKey`);
        if (apiKey) headers['X-API-Key'] = apiKey;
        break;
      case 'basic':
        const credentials = await AsyncStorage.getItem(`${endpoint.id}_credentials`);
        if (credentials) {
          const {username, password} = JSON.parse(credentials);
          const encoded = btoa(`${username}:${password}`);
          headers['Authorization'] = `Basic ${encoded}`;
        }
        break;
    }
    
    return headers;
  }

  private async executeWithRetry(
    url: string,
    options: RequestInit,
    retryPolicy: APIEndpoint['retryPolicy']
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!retryPolicy.retryableStatuses.includes(response.status)) {
          return response;
        }
        
        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error as Error;
      }
      
      if (attempt < retryPolicy.maxRetries) {
        await this.delay(retryPolicy.retryDelay * Math.pow(2, attempt));
      }
    }
    
    throw lastError || new Error('Request failed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private addToCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  private updateMetrics(success: boolean, responseTime: number): void {
    this.metrics.totalRequests++;
    if (success) this.metrics.successfulRequests++;
    else this.metrics.failedRequests++;
    
    const prevAvg = this.metrics.avgResponseTime;
    const totalCount = this.metrics.totalRequests;
    this.metrics.avgResponseTime = (prevAvg * (totalCount - 1) + responseTime) / totalCount;
  }

  public getMetrics() {
    return {...this.metrics};
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
