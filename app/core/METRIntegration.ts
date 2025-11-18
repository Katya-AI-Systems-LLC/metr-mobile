// METRIntegration.ts - Integration Hub for All METR Components
// Provides unified API access to all METR features

// Re-export all major components for easy access
export {AIManager} from '../ai/core/AIManager';
export {PersonalAssistant} from '../ai/assistants/PersonalAssistant';
export {TeamAssistant} from '../ai/assistants/TeamAssistant';
export {DigitalTwin} from '../ai/DigitalTwin';

export {Web3Manager} from '../web3/Web3Manager';

export {ZeroKnowledgeEncryption} from '../security/ZeroKnowledgeEncryption';
export {BiometricAuth} from '../security/BiometricAuth';

export {default as VirtualOfficeManager} from '../ar/VirtualOfficeManager';
export {QuantumComputing} from '../quantum/QuantumComputing';

export {CrossPlatformSync} from '../sync/CrossPlatformSync';
export {default as IOSPlatformFeatures} from '../mobile/ios/IOSPlatformFeatures';
export {default as AndroidPlatformFeatures} from '../mobile/android/AndroidPlatformFeatures';

export {AdaptiveUI} from '../ui/AdaptiveUI';
export {GestureNavigation} from '../ui/GestureNavigation';
export {VoiceUI} from '../ui/VoiceUI';
export {DynamicThemes} from '../ui/DynamicThemes';
export {default as ForceTouchHandler} from '../ui/ForceTouchHandler';
export {MicroInteractions} from '../ui/MicroInteractions';

export {default as BrandingManager} from '../components/branding/BrandingManager';
export {METRLogo} from '../components/branding/METRLogo';

export {AIMoodRing} from '../features/AIMoodRing';
export {CodePoetry} from '../fun/CodePoetry';

export {METRInitializer, initializeMETR} from './METRInitializer';

// Unified API class
export class METR {
  // AI
  static get AI() {
    return {
      manager: AIManager.getInstance(),
      personal: new PersonalAssistant({
        preferredProvider: 'openai',
        model: 'gpt-4',
        personality: 'friendly',
      }),
      team: TeamAssistant.getInstance(),
      digitalTwin: DigitalTwin.getInstance(),
    };
  }

  // Web3
  static get Web3() {
    return {
      manager: Web3Manager.getInstance(),
    };
  }

  // Security
  static get Security() {
    return {
      zkEncryption: ZeroKnowledgeEncryption.getInstance(),
      biometric: BiometricAuth.getInstance(),
    };
  }

  // AR/VR
  static get ARVR() {
    return {
      virtualOffice: VirtualOfficeManager.getInstance(),
    };
  }

  // Quantum
  static get Quantum() {
    return QuantumComputing.getInstance();
  }

  // Platform
  static get Platform() {
    const {Platform} = require('react-native');
    if (Platform.OS === 'ios') {
      return IOSPlatformFeatures.getInstance();
    } else if (Platform.OS === 'android') {
      return AndroidPlatformFeatures.getInstance();
    }
    return null;
  }

  // UI
  static get UI() {
    return {
      adaptive: AdaptiveUI.getInstance(),
      gestures: GestureNavigation.getInstance(),
      voice: VoiceUI.getInstance(),
      themes: DynamicThemes.getInstance(),
      forceTouch: ForceTouchHandler.getInstance(),
      microInteractions: MicroInteractions.getInstance(),
    };
  }

  // Sync
  static get Sync() {
    return CrossPlatformSync.getInstance();
  }

  // Branding
  static get Branding() {
    return BrandingManager.getInstance();
  }

  // Unique Features
  static get Features() {
    return {
      moodRing: AIMoodRing.getInstance(),
      codePoetry: CodePoetry.getInstance(),
    };
  }

  // Initialize everything
  static async initialize(config?: any) {
    const {initializeMETR} = require('./METRInitializer');
    return await initializeMETR(config);
  }
}

export default METR;

