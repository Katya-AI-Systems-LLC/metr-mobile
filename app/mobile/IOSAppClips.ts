// IOSAppClips.ts - Manager for iOS App Clips integration in METR
import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';

export interface AppClipContext {
  invocationUrl?: string;
  payload?: any;
}

class IOSAppClipsManager {
  private static instance: IOSAppClipsManager;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): IOSAppClipsManager {
    if (!IOSAppClipsManager.instance) {
      IOSAppClipsManager.instance = new IOSAppClipsManager();
    }
    return IOSAppClipsManager.instance;
  }

  private setupListeners() {
    if (Platform.OS !== 'ios') {
      return;
    }

    DeviceEventEmitter.addListener('ios_appclip_invoked', (context: AppClipContext) => {
      DeviceEventEmitter.emit('metr_appclip_invoked', context);
    });
  }

  public async requestAppClip(context?: AppClipContext): Promise<void> {
    if (Platform.OS === 'ios' && NativeModules.IOSAppClipsModule) {
      try {
        await NativeModules.IOSAppClipsModule.presentAppClip(context || {});
      } catch (e) {
        // ignore in dev
      }
    }
  }
}

export default IOSAppClipsManager;

