// AndroidQuickSettings.ts - Manager for Android Quick Settings tiles in METR
import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';

export interface QuickSettingsTileConfig {
  id: string;
  label: string;
  icon?: string;
  state?: 'active' | 'inactive' | 'unavailable';
}

class AndroidQuickSettingsManager {
  private static instance: AndroidQuickSettingsManager;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): AndroidQuickSettingsManager {
    if (!AndroidQuickSettingsManager.instance) {
      AndroidQuickSettingsManager.instance = new AndroidQuickSettingsManager();
    }
    return AndroidQuickSettingsManager.instance;
  }

  private setupListeners() {
    if (Platform.OS !== 'android') {
      return;
    }

    DeviceEventEmitter.addListener('android_qs_tile_clicked', (data: any) => {
      DeviceEventEmitter.emit('metr_qs_tile_clicked', data);
    });
  }

  public registerTiles(tiles: QuickSettingsTileConfig[]): void {
    if (Platform.OS === 'android' && NativeModules.AndroidQuickSettingsModule) {
      try {
        NativeModules.AndroidQuickSettingsModule.registerTiles(tiles);
      } catch (e) {
        // ignore
      }
    }
  }
}

export default AndroidQuickSettingsManager;

