// AndroidMaterialYou.ts - Manager for Android Material You integration in METR
import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';

export interface MaterialYouPalette {
  primary: string;
  primaryVariant?: string;
  secondary?: string;
  background?: string;
  surface?: string;
}

class AndroidMaterialYouManager {
  private static instance: AndroidMaterialYouManager;

  private constructor() {
    this.setupListener();
  }

  public static getInstance(): AndroidMaterialYouManager {
    if (!AndroidMaterialYouManager.instance) {
      AndroidMaterialYouManager.instance = new AndroidMaterialYouManager();
    }
    return AndroidMaterialYouManager.instance;
  }

  private setupListener() {
    if (Platform.OS !== 'android') {
      return;
    }

    DeviceEventEmitter.addListener('android_material_you_changed', (palette: MaterialYouPalette) => {
      DeviceEventEmitter.emit('metr_material_you_changed', palette);
    });
  }

  public async fetchSystemPalette(): Promise<MaterialYouPalette | null> {
    if (Platform.OS === 'android' && NativeModules.AndroidMaterialYouModule) {
      try {
        const palette = await NativeModules.AndroidMaterialYouModule.getSystemPalette();
        return palette as MaterialYouPalette;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

export default AndroidMaterialYouManager;

