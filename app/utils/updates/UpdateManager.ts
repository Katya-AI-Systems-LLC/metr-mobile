// UpdateManager.ts - App Update Management for METR
import {DeviceEventEmitter, Platform, Linking} from 'react-native';
import VersionCheck from 'react-native-version-check';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateType: 'patch' | 'minor' | 'major' | null;
  releaseNotes?: string;
  downloadUrl?: string;
  forceUpdate: boolean;
}

interface UpdateConfig {
  checkOnStartup: boolean;
  checkInterval: number; // milliseconds
  enableAutoUpdate: boolean;
  showUpdateDialog: boolean;
}

export class UpdateManager {
  private static instance: UpdateManager;
  private config: UpdateConfig;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      checkOnStartup: true,
      checkInterval: 3600000, // 1 hour
      enableAutoUpdate: false,
      showUpdateDialog: true,
    };

    if (this.config.checkOnStartup) {
      this.checkForUpdates();
    }

    this.setupPeriodicCheck();
  }

  public static getInstance(): UpdateManager {
    if (!UpdateManager.instance) {
      UpdateManager.instance = new UpdateManager();
    }
    return UpdateManager.instance;
  }

  // Check for updates
  public async checkForUpdates(): Promise<UpdateInfo> {
    try {
      const currentVersion = await VersionCheck.getCurrentVersion();
      const latestVersion = await VersionCheck.getLatestVersion({
        provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
      });

      const updateAvailable = currentVersion !== latestVersion;
      const updateType = this.getUpdateType(currentVersion, latestVersion);

      const updateInfo: UpdateInfo = {
        currentVersion,
        latestVersion,
        updateAvailable,
        updateType,
        forceUpdate: updateType === 'major',
      };

      if (updateAvailable) {
        DeviceEventEmitter.emit('update_available', updateInfo);
        
        if (this.config.showUpdateDialog) {
          this.showUpdateDialog(updateInfo);
        }
      }

      return updateInfo;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        currentVersion: 'unknown',
        latestVersion: 'unknown',
        updateAvailable: false,
        updateType: null,
        forceUpdate: false,
      };
    }
  }

  // Get update type
  private getUpdateType(current: string, latest: string): 'patch' | 'minor' | 'major' | null {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    if (latestParts[0] > currentParts[0]) return 'major';
    if (latestParts[1] > currentParts[1]) return 'minor';
    if (latestParts[2] > currentParts[2]) return 'patch';
    return null;
  }

  // Show update dialog
  private showUpdateDialog(updateInfo: UpdateInfo): void {
    DeviceEventEmitter.emit('show_update_dialog', {
      title: 'Update Available',
      message: `A new version (${updateInfo.latestVersion}) is available.`,
      updateType: updateInfo.updateType,
      forceUpdate: updateInfo.forceUpdate,
    });
  }

  // Open app store
  public async openAppStore(): Promise<void> {
    try {
      const storeUrl = await VersionCheck.getStoreUrl({
        appID: Platform.OS === 'ios' ? 'your-app-id' : 'com.metr.app',
      });
      await Linking.openURL(storeUrl);
    } catch (error) {
      console.error('Failed to open app store:', error);
    }
  }

  // Setup periodic check
  private setupPeriodicCheck(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }

    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.config.checkInterval);
  }

  // Configure update manager
  public configure(config: Partial<UpdateConfig>): void {
    this.config = {...this.config, ...config};
    this.setupPeriodicCheck();
  }

  // Stop update checking
  public stop(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }
}

export default UpdateManager;


