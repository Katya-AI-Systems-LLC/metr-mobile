// DataSync.ts - Advanced Data Synchronization for METR
import {DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {OfflineManager} from '../offline/OfflineManager';

interface SyncConfig {
  enableAutoSync: boolean;
  syncInterval: number;
  enableConflictResolution: boolean;
  conflictStrategy: 'server' | 'client' | 'merge' | 'manual';
  enableCompression: boolean;
  batchSize: number;
}

interface SyncStatus {
  syncing: boolean;
  lastSync: number | null;
  conflicts: number;
  pending: number;
  errors: number;
}

interface SyncItem {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  version: number;
  conflict?: boolean;
}

export class DataSync {
  private static instance: DataSync;
  private config: SyncConfig;
  private syncStatus: SyncStatus;
  private offlineManager: OfflineManager;
  private syncQueue: SyncItem[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enableAutoSync: true,
      syncInterval: 30000, // 30 seconds
      enableConflictResolution: true,
      conflictStrategy: 'server',
      enableCompression: true,
      batchSize: 50,
    };

    this.syncStatus = {
      syncing: false,
      lastSync: null,
      conflicts: 0,
      pending: 0,
      errors: 0,
    };

    this.offlineManager = OfflineManager.getInstance();
    this.setupSync();
  }

  public static getInstance(): DataSync {
    if (!DataSync.instance) {
      DataSync.instance = new DataSync();
    }
    return DataSync.instance;
  }

  // Setup sync
  private setupSync(): void {
    if (this.config.enableAutoSync) {
      this.syncInterval = setInterval(() => {
        this.sync();
      }, this.config.syncInterval);
    }

    // Listen for data changes
    DeviceEventEmitter.addListener('data_changed', (data: any) => {
      this.queueSync(data);
    });
  }

  // Queue sync item
  private queueSync(data: any): void {
    const syncItem: SyncItem = {
      id: data.id || `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      data: data.data,
      timestamp: Date.now(),
      version: data.version || 1,
    };

    this.syncQueue.push(syncItem);
    this.syncStatus.pending = this.syncQueue.length;

    // Trigger sync if not already syncing
    if (!this.syncStatus.syncing) {
      this.sync();
    }
  }

  // Sync data
  public async sync(): Promise<void> {
    if (this.syncStatus.syncing || this.syncQueue.length === 0) {
      return;
    }

    this.syncStatus.syncing = true;
    DeviceEventEmitter.emit('sync_started');

    try {
      // Get batch to sync
      const batch = this.syncQueue.splice(0, this.config.batchSize);
      this.syncStatus.pending = this.syncQueue.length;

      // Sync batch
      for (const item of batch) {
        try {
          await this.syncItem(item);
        } catch (error) {
          console.error('Failed to sync item:', error);
          this.syncStatus.errors++;
          
          // Re-queue if retryable
          if (this.shouldRetry(error)) {
            this.syncQueue.push(item);
          }
        }
      }

      this.syncStatus.lastSync = Date.now();
      this.syncStatus.pending = this.syncQueue.length;

      DeviceEventEmitter.emit('sync_completed', {
        synced: batch.length,
        pending: this.syncStatus.pending,
      });
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus.errors++;
      DeviceEventEmitter.emit('sync_failed', {error});
    } finally {
      this.syncStatus.syncing = false;
    }
  }

  // Sync single item
  private async syncItem(item: SyncItem): Promise<void> {
    // Check for conflicts
    if (this.config.enableConflictResolution) {
      const conflict = await this.checkConflict(item);
      if (conflict) {
        item.conflict = true;
        this.syncStatus.conflicts++;
        
        const resolved = await this.resolveConflict(item, conflict);
        if (!resolved) {
          throw new Error('Conflict resolution failed');
        }
      }
    }

    // Sync to server
    await this.syncToServer(item);

    // Update local storage
    await this.updateLocalStorage(item);
  }

  // Check for conflicts
  private async checkConflict(item: SyncItem): Promise<any> {
    // In production, check server version
    return null;
  }

  // Resolve conflict
  private async resolveConflict(item: SyncItem, conflict: any): Promise<boolean> {
    switch (this.config.conflictStrategy) {
      case 'server':
        // Use server version
        item.data = conflict.serverData;
        return true;

      case 'client':
        // Use client version
        return true;

      case 'merge':
        // Merge both versions
        item.data = {...conflict.serverData, ...item.data};
        return true;

      case 'manual':
        // Require manual resolution
        DeviceEventEmitter.emit('conflict_detected', {item, conflict});
        return false;

      default:
        return false;
    }
  }

  // Sync to server
  private async syncToServer(item: SyncItem): Promise<void> {
    // In production, send to API
    await this.offlineManager.queueRequest(
      '/api/sync',
      'POST',
      item,
      {'Content-Type': 'application/json'}
    );
  }

  // Update local storage
  private async updateLocalStorage(item: SyncItem): Promise<void> {
    try {
      await AsyncStorage.setItem(`sync_${item.id}`, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to update local storage:', error);
    }
  }

  // Should retry
  private shouldRetry(error: any): boolean {
    // Retry on network errors
    return error.message?.includes('network') || error.message?.includes('timeout');
  }

  // Get sync status
  public getStatus(): SyncStatus {
    return {...this.syncStatus};
  }

  // Force sync
  public async forceSync(): Promise<void> {
    await this.sync();
  }

  // Configure sync
  public configure(config: Partial<SyncConfig>): void {
    this.config = {...this.config, ...config};
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.setupSync();
  }

  // Stop sync
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export default DataSync;


