// AndroidBubbles.ts - Manager for Android Bubbles integration in METR
import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';

export interface BubbleConfig {
  id: string;
  title: string;
  message?: string;
  payload?: any;
}

class AndroidBubblesManager {
  private static instance: AndroidBubblesManager;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): AndroidBubblesManager {
    if (!AndroidBubblesManager.instance) {
      AndroidBubblesManager.instance = new AndroidBubblesManager();
    }
    return AndroidBubblesManager.instance;
  }

  private setupListeners() {
    if (Platform.OS !== 'android') {
      return;
    }

    DeviceEventEmitter.addListener('android_bubble_opened', (data: any) => {
      DeviceEventEmitter.emit('metr_bubble_opened', data);
    });

    DeviceEventEmitter.addListener('android_bubble_dismissed', (data: any) => {
      DeviceEventEmitter.emit('metr_bubble_dismissed', data);
    });
  }

  public showBubble(config: BubbleConfig): void {
    if (Platform.OS === 'android' && NativeModules.AndroidBubblesModule) {
      try {
        NativeModules.AndroidBubblesModule.showBubble(config);
      } catch (e) {
        // ignore
      }
    }
  }
}

export default AndroidBubblesManager;

