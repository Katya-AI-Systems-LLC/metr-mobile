// METRCache.ts - Advanced Caching System for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {METRPerformance} from '../performance/METRPerformance';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // milliseconds
  enableLRU: boolean;
  enableCompression: boolean;
}

export class METRCache {
  private static instance: METRCache;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private performance: METRPerformance;

  private constructor() {
    this.config = {
      maxSize: 1000,
      defaultTTL: 3600000, // 1 hour
      enableLRU: true,
      enableCompression: true,
    };

    this.performance = METRPerformance.getInstance();
    this.loadPersistedCache();
  }

  public static getInstance(): METRCache {
    if (!METRCache.instance) {
      METRCache.instance = new METRCache();
    }
    return METRCache.instance;
  }

  // Set cache entry
  public async set<T>(
    key: string,
    data: T,
    ttl?: number
  ): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    // Check size limit
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.memoryCache.set(key, entry);

    // Persist to storage
    await this.persistCache(key, entry);
  }

  // Get cache entry
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      // Try to load from persisted storage
      const persisted = await this.loadFromStorage<T>(key);
      if (persisted) {
        this.memoryCache.set(key, persisted);
        return persisted.data;
      }
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    // Update access info
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // Delete cache entry
  public async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await AsyncStorage.removeItem(`cache_${key}`);
  }

  // Clear all cache
  public async clear(): Promise<void> {
    this.memoryCache.clear();
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  }

  // Get cache stats
  public getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{key: string; age: number; accessCount: number}>;
  } {
    const entries = Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      accessCount: entry.accessCount,
    }));

    return {
      size: this.memoryCache.size,
      hitRate: 0, // Calculate from performance metrics
      entries,
    };
  }

  // Evict LRU entry
  private evictLRU(): void {
    if (!this.config.enableLRU) {
      // Remove oldest entry
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
      return;
    }

    // Find least recently used
    let lruKey: string | null = null;
    let lruTime = Infinity;

    this.memoryCache.forEach((entry, key) => {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.memoryCache.delete(lruKey);
    }
  }

  // Persist cache to storage
  private async persistCache(key: string, entry: CacheEntry<any>): Promise<void> {
    try {
      const serialized = JSON.stringify(entry);
      await AsyncStorage.setItem(`cache_${key}`, serialized);
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }

  // Load from storage
  private async loadFromStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const serialized = await AsyncStorage.getItem(`cache_${key}`);
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
    return null;
  }

  // Load persisted cache on startup
  private async loadPersistedCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache_'));
      
      // Load top 100 entries
      const entriesToLoad = cacheKeys.slice(0, 100);
      const entries = await AsyncStorage.multiGet(entriesToLoad);
      
      entries.forEach(([key, value]) => {
        if (value) {
          try {
            const entry = JSON.parse(value);
            const cacheKey = key.replace('cache_', '');
            this.memoryCache.set(cacheKey, entry);
          } catch (error) {
            // Skip invalid entries
          }
        }
      });
    } catch (error) {
      console.error('Failed to load persisted cache:', error);
    }
  }

  // Configure cache
  public configure(config: Partial<CacheConfig>): void {
    this.config = {...this.config, ...config};
  }
}

export default METRCache;


