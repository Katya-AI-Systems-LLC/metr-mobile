// BackupManager.ts - Backup and Restore Manager for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {DeviceEventEmitter} from 'react-native';
import {DataCompressor} from '../compression/DataCompressor';

interface BackupConfig {
  includeSettings: boolean;
  includeData: boolean;
  includeCache: boolean;
  compress: boolean;
  encrypt: boolean;
}

interface BackupInfo {
  id: string;
  timestamp: number;
  size: number;
  version: string;
  items: string[];
}

export class BackupManager {
  private static instance: BackupManager;
  private compressor: DataCompressor;

  private constructor() {
    this.compressor = DataCompressor.getInstance();
  }

  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  // Create backup
  public async createBackup(config: Partial<BackupConfig> = {}): Promise<string> {
    const backupConfig: BackupConfig = {
      includeSettings: true,
      includeData: true,
      includeCache: false,
      compress: true,
      encrypt: false,
      ...config,
    };

    const backup: any = {
      version: '2.2.0',
      timestamp: Date.now(),
      items: [],
      data: {},
    };

    // Backup settings
    if (backupConfig.includeSettings) {
      const settings = await this.backupSettings();
      backup.data.settings = settings;
      backup.items.push('settings');
    }

    // Backup data
    if (backupConfig.includeData) {
      const data = await this.backupData();
      backup.data.data = data;
      backup.items.push('data');
    }

    // Backup cache
    if (backupConfig.includeCache) {
      const cache = await this.backupCache();
      backup.data.cache = cache;
      backup.items.push('cache');
    }

    // Serialize backup
    let backupString = JSON.stringify(backup);

    // Compress if needed
    if (backupConfig.compress) {
      backupString = this.compressor.compress(backupString);
    }

    // Save backup file
    const backupId = `backup_${Date.now()}`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${backupId}.backup`;
    await RNFS.writeFile(filePath, backupString, 'utf8');

    const backupInfo: BackupInfo = {
      id: backupId,
      timestamp: Date.now(),
      size: backupString.length,
      version: backup.version,
      items: backup.items,
    };

    // Save backup info
    await this.saveBackupInfo(backupInfo);

    DeviceEventEmitter.emit('backup_created', {backupInfo});

    return filePath;
  }

  // Restore backup
  public async restoreBackup(filePath: string): Promise<boolean> {
    try {
      // Read backup file
      let backupString = await RNFS.readFile(filePath, 'utf8');

      // Decompress if needed
      try {
        backupString = this.compressor.decompress(backupString);
      } catch {
        // Not compressed, use as is
      }

      const backup = JSON.parse(backupString);

      // Restore settings
      if (backup.data.settings) {
        await this.restoreSettings(backup.data.settings);
      }

      // Restore data
      if (backup.data.data) {
        await this.restoreData(backup.data.data);
      }

      // Restore cache
      if (backup.data.cache) {
        await this.restoreCache(backup.data.cache);
      }

      DeviceEventEmitter.emit('backup_restored', {backup});

      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      DeviceEventEmitter.emit('backup_restore_failed', {error});
      return false;
    }
  }

  // Backup settings
  private async backupSettings(): Promise<Record<string, any>> {
    const keys = await AsyncStorage.getAllKeys();
    const settingsKeys = keys.filter(key => key.startsWith('settings_') || key.startsWith('preferences_'));
    const settings: Record<string, any> = {};

    for (const key of settingsKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        settings[key] = JSON.parse(value);
      }
    }

    return settings;
  }

  // Backup data
  private async backupData(): Promise<Record<string, any>> {
    const keys = await AsyncStorage.getAllKeys();
    const dataKeys = keys.filter(key => !key.startsWith('settings_') && !key.startsWith('preferences_') && !key.startsWith('cache_'));
    const data: Record<string, any> = {};

    for (const key of dataKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        data[key] = JSON.parse(value);
      }
    }

    return data;
  }

  // Backup cache
  private async backupCache(): Promise<Record<string, any>> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    const cache: Record<string, any> = {};

    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        cache[key] = JSON.parse(value);
      }
    }

    return cache;
  }

  // Restore settings
  private async restoreSettings(settings: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Restore data
  private async restoreData(data: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Restore cache
  private async restoreCache(cache: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(cache)) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Save backup info
  private async saveBackupInfo(info: BackupInfo): Promise<void> {
    const backups = await this.getBackups();
    backups.push(info);
    await AsyncStorage.setItem('backups', JSON.stringify(backups));
  }

  // Get backups
  public async getBackups(): Promise<BackupInfo[]> {
    try {
      const stored = await AsyncStorage.getItem('backups');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Share backup
  public async shareBackup(filePath: string): Promise<void> {
    try {
      await Share.open({
        url: `file://${filePath}`,
        title: 'METR Backup',
        message: 'METR backup file',
      });
    } catch (error) {
      console.error('Failed to share backup:', error);
    }
  }
}

export default BackupManager;


