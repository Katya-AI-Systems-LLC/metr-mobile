// OfflineManager.ts - Advanced Offline Support for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {DeviceEventEmitter} from 'react-native';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private requestQueue: QueuedRequest[] = [];
  private syncInProgress: boolean = false;

  private constructor() {
    this.setupNetworkMonitoring();
    this.loadQueuedRequests();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Back online - sync queued requests
        this.syncQueuedRequests();
      }

      DeviceEventEmitter.emit('network_status_changed', {
        isOnline: this.isOnline,
        type: state.type,
      });
    });
  }

  // Queue request for offline
  public async queueRequest(
    url: string,
    method: string = 'GET',
    body?: any,
    headers?: Record<string, string>
  ): Promise<string> {
    const request: QueuedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      body,
      headers,
      timestamp: Date.now(),
      retries: 0,
    };

    this.requestQueue.push(request);
    await this.saveQueuedRequests();

    // Try to execute if online
    if (this.isOnline) {
      this.syncQueuedRequests();
    }

    return request.id;
  }

  // Sync queued requests
  private async syncQueuedRequests(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.requestQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const requests = [...this.requestQueue];
      this.requestQueue = [];

      for (const request of requests) {
        try {
          await this.executeRequest(request);
          // Remove from queue on success
          await this.removeQueuedRequest(request.id);
        } catch (error) {
          // Retry logic
          if (request.retries < 3) {
            request.retries++;
            this.requestQueue.push(request);
          } else {
            // Max retries reached - keep in queue for manual retry
            console.error(`Failed to sync request ${request.id} after ${request.retries} retries`);
            this.requestQueue.push(request);
          }
        }
      }

      await this.saveQueuedRequests();
    } finally {
      this.syncInProgress = false;
    }
  }

  // Execute request
  private async executeRequest(request: QueuedRequest): Promise<void> {
    const options: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.headers,
      },
    };

    if (request.body) {
      options.body = JSON.stringify(request.body);
    }

    const response = await fetch(request.url, options);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    DeviceEventEmitter.emit('offline_request_synced', {
      requestId: request.id,
      url: request.url,
    });
  }

  // Save queued requests
  private async saveQueuedRequests(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(this.requestQueue));
    } catch (error) {
      console.error('Failed to save queued requests:', error);
    }
  }

  // Load queued requests
  private async loadQueuedRequests(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_queue');
      if (stored) {
        this.requestQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load queued requests:', error);
    }
  }

  // Remove queued request
  private async removeQueuedRequest(id: string): Promise<void> {
    this.requestQueue = this.requestQueue.filter(req => req.id !== id);
    await this.saveQueuedRequests();
  }

  // Get queue status
  public getQueueStatus(): {
    queued: number;
    isOnline: boolean;
    syncInProgress: boolean;
  } {
    return {
      queued: this.requestQueue.length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
    };
  }

  // Clear queue
  public async clearQueue(): Promise<void> {
    this.requestQueue = [];
    await AsyncStorage.removeItem('offline_queue');
  }
}

export default OfflineManager;


