// IOSWidgets.ts - High-level manager for iOS Widgets integration in METR
import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';

export interface IOSWidgetState {
  id: string;
  data: any;
}

class IOSWidgetsManager {
  private static instance: IOSWidgetsManager;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): IOSWidgetsManager {
    if (!IOSWidgetsManager.instance) {
      IOSWidgetsManager.instance = new IOSWidgetsManager();
    }
    return IOSWidgetsManager.instance;
  }

  private setupListeners() {
    if (Platform.OS !== 'ios') {
      return;
    }

    DeviceEventEmitter.addListener('ios_widget_tap', (data: any) => {
      DeviceEventEmitter.emit('metr_widget_tap', data);
    });
  }

  public async updateWidget(state: IOSWidgetState): Promise<void> {
    if (Platform.OS === 'ios' && NativeModules.IOSWidgetsModule) {
      try {
        await NativeModules.IOSWidgetsModule.updateWidget(state.id, state.data);
      } catch (e) {
        // ignore in dev
      }
    }
  }

  public async refreshAll(): Promise<void> {
    if (Platform.OS === 'ios' && NativeModules.IOSWidgetsModule) {
      try {
        await NativeModules.IOSWidgetsModule.refreshAll();
      } catch (e) {
        // ignore
      }
    }
  }
}

export default IOSWidgetsManager;

