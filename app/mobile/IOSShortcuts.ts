// IOSShortcuts.ts - High-level manager for iOS Shortcuts integration in METR
import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';

export interface IOSShortcutDefinition {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  payload?: any;
}

class IOSShortcutsManager {
  private static instance: IOSShortcutsManager;
  private shortcuts: Map<string, IOSShortcutDefinition> = new Map();

  private constructor() {
    this.setupListener();
  }

  public static getInstance(): IOSShortcutsManager {
    if (!IOSShortcutsManager.instance) {
      IOSShortcutsManager.instance = new IOSShortcutsManager();
    }
    return IOSShortcutsManager.instance;
  }

  private setupListener() {
    if (Platform.OS !== 'ios') {
      return;
    }

    DeviceEventEmitter.addListener('ios_shortcut_triggered', (data: any) => {
      const shortcut = this.shortcuts.get(data?.id);
      if (shortcut) {
        DeviceEventEmitter.emit('metr_shortcut_invoked', shortcut);
      }
    });
  }

  public registerShortcuts(list: IOSShortcutDefinition[]): void {
    list.forEach((s) => {
      this.shortcuts.set(s.id, s);
    });

    if (Platform.OS === 'ios' && NativeModules.IOSShortcutsModule) {
      try {
        NativeModules.IOSShortcutsModule.registerShortcuts(list);
      } catch (e) {
        // no-op in dev
      }
    }
  }

  public clearShortcuts(): void {
    this.shortcuts.clear();
    if (Platform.OS === 'ios' && NativeModules.IOSShortcutsModule) {
      try {
        NativeModules.IOSShortcutsModule.clearShortcuts();
      } catch (e) {
        // no-op
      }
    }
  }
}

export default IOSShortcutsManager;

