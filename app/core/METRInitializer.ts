// METRInitializer.ts - Main Initialization File for METR Platform
// This file initializes all METR components and features
import {DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AI Modules
import {AIManager} from '../ai/core/AIManager';
import {PersonalAssistant} from '../ai/assistants/PersonalAssistant';
import {TeamAssistant} from '../ai/assistants/TeamAssistant';

// Web3 Modules
import {Web3Manager} from '../web3/Web3Manager';

// Security Modules
import {ZeroKnowledgeEncryption} from '../security/ZeroKnowledgeEncryption';
import {BiometricAuth} from '../security/BiometricAuth';

// AR/VR Modules
import VirtualOfficeManager from '../ar/VirtualOfficeManager';

// Quantum Computing
import {QuantumComputing} from '../quantum/QuantumComputing';

// Sync & Platform Features
import {CrossPlatformSync} from '../sync/CrossPlatformSync';
import IOSPlatformFeatures from '../mobile/ios/IOSPlatformFeatures';
import AndroidPlatformFeatures from '../mobile/android/AndroidPlatformFeatures';

// UI Components
import {AdaptiveUI} from '../ui/AdaptiveUI';
import {GestureNavigation} from '../ui/GestureNavigation';
import {VoiceUI} from '../ui/VoiceUI';
import {DynamicThemes} from '../ui/DynamicThemes';
import ForceTouchHandler from '../ui/ForceTouchHandler';
import {MicroInteractions} from '../ui/MicroInteractions';

// Branding
import BrandingManager from '../components/branding/BrandingManager';

// Unique Features
import {AIMoodRing} from '../features/AIMoodRing';
import {CodePoetry} from '../fun/CodePoetry';

// Digital Twin
import {DigitalTwin} from '../ai/DigitalTwin';

interface InitializationConfig {
  enableAI: boolean;
  enableWeb3: boolean;
  enableARVR: boolean;
  enableQuantum: boolean;
  enableSecurity: boolean;
  enablePlatformFeatures: boolean;
  enableUniqueFeatures: boolean;
  enableVoiceUI: boolean;
  enableForceTouch: boolean;
}

interface InitializationStatus {
  initialized: boolean;
  modules: {
    [key: string]: {
      initialized: boolean;
      error?: string;
      timestamp: Date;
    };
  };
  errors: string[];
}

export class METRInitializer {
  private static instance: METRInitializer;
  private status: InitializationStatus;
  private config: InitializationConfig;

  private constructor() {
    this.status = {
      initialized: false,
      modules: {},
      errors: [],
    };
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): METRInitializer {
    if (!METRInitializer.instance) {
      METRInitializer.instance = new METRInitializer();
    }
    return METRInitializer.instance;
  }

  private getDefaultConfig(): InitializationConfig {
    return {
      enableAI: true,
      enableWeb3: true,
      enableARVR: true,
      enableQuantum: true,
      enableSecurity: true,
      enablePlatformFeatures: true,
      enableUniqueFeatures: true,
      enableVoiceUI: true,
      enableForceTouch: true,
    };
  }

  // Main initialization method
  public async initialize(config?: Partial<InitializationConfig>): Promise<void> {
    if (this.status.initialized) {
      console.log('METR already initialized');
      return;
    }

    // Merge config
    if (config) {
      this.config = {...this.config, ...config};
    }

    console.log('🚀 Initializing METR Platform...');
    DeviceEventEmitter.emit('metr_initialization_started');

    try {
      // 1. Initialize Branding
      await this.initializeBranding();

      // 2. Initialize Security (must be first)
      if (this.config.enableSecurity) {
        await this.initializeSecurity();
      }

      // 3. Initialize AI Modules
      if (this.config.enableAI) {
        await this.initializeAI();
      }

      // 4. Initialize Web3
      if (this.config.enableWeb3) {
        await this.initializeWeb3();
      }

      // 5. Initialize AR/VR
      if (this.config.enableARVR) {
        await this.initializeARVR();
      }

      // 6. Initialize Quantum Computing
      if (this.config.enableQuantum) {
        await this.initializeQuantum();
      }

      // 7. Initialize Platform Features
      if (this.config.enablePlatformFeatures) {
        await this.initializePlatformFeatures();
      }

      // 8. Initialize UI Components
      await this.initializeUI();

      // 9. Initialize Unique Features
      if (this.config.enableUniqueFeatures) {
        await this.initializeUniqueFeatures();
      }

      // 10. Initialize Sync
      await this.initializeSync();

      // Mark as initialized
      this.status.initialized = true;
      await this.saveInitializationStatus();

      console.log('✅ METR Platform initialized successfully!');
      DeviceEventEmitter.emit('metr_initialization_completed', this.status);
    } catch (error) {
      console.error('❌ METR initialization failed:', error);
      this.status.errors.push(error instanceof Error ? error.message : String(error));
      DeviceEventEmitter.emit('metr_initialization_failed', {error, status: this.status});
      throw error;
    }
  }

  private async initializeBranding(): Promise<void> {
    try {
      const brandingManager = BrandingManager.getInstance();
      this.status.modules.branding = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ Branding initialized');
    } catch (error) {
      this.handleModuleError('branding', error);
    }
  }

  private async initializeSecurity(): Promise<void> {
    try {
      // Initialize Zero-Knowledge Encryption
      const zkEncryption = ZeroKnowledgeEncryption.getInstance();
      
      // Initialize Biometric Auth
      const biometricAuth = BiometricAuth.getInstance();
      await biometricAuth.initialize();

      this.status.modules.security = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ Security modules initialized');
    } catch (error) {
      this.handleModuleError('security', error);
    }
  }

  private async initializeAI(): Promise<void> {
    try {
      // Initialize AI Manager
      const aiManager = AIManager.getInstance();
      
      // Initialize Personal Assistant
      const personalAssistant = new PersonalAssistant({
        preferredProvider: 'openai',
        model: 'gpt-4',
        personality: 'friendly',
      });
      
      // Initialize Team Assistant
      const teamAssistant = TeamAssistant.getInstance();
      
      // Initialize Digital Twin
      const digitalTwin = DigitalTwin.getInstance();

      this.status.modules.ai = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ AI modules initialized');
    } catch (error) {
      this.handleModuleError('ai', error);
    }
  }

  private async initializeWeb3(): Promise<void> {
    try {
      const web3Manager = Web3Manager.getInstance();
      await web3Manager.initialize();

      this.status.modules.web3 = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ Web3 modules initialized');
    } catch (error) {
      this.handleModuleError('web3', error);
    }
  }

  private async initializeARVR(): Promise<void> {
    try {
      const virtualOffice = VirtualOfficeManager.getInstance();
      
      this.status.modules.arvr = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ AR/VR modules initialized');
    } catch (error) {
      this.handleModuleError('arvr', error);
    }
  }

  private async initializeQuantum(): Promise<void> {
    try {
      const quantumComputing = QuantumComputing.getInstance();
      
      this.status.modules.quantum = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ Quantum computing initialized');
    } catch (error) {
      this.handleModuleError('quantum', error);
    }
  }

  private async initializePlatformFeatures(): Promise<void> {
    try {
      const {Platform} = require('react-native');
      
      if (Platform.OS === 'ios') {
        const iosFeatures = IOSPlatformFeatures.getInstance();
        await iosFeatures.initialize();
      } else if (Platform.OS === 'android') {
        const androidFeatures = AndroidPlatformFeatures.getInstance();
        await androidFeatures.initialize();
      }

      this.status.modules.platformFeatures = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ Platform features initialized');
    } catch (error) {
      this.handleModuleError('platformFeatures', error);
    }
  }

  private async initializeUI(): Promise<void> {
    try {
      // Initialize Adaptive UI
      const adaptiveUI = AdaptiveUI.getInstance();
      
      // Initialize Gesture Navigation
      const gestureNav = GestureNavigation.getInstance();
      
      // Initialize Dynamic Themes
      const dynamicThemes = DynamicThemes.getInstance();
      
      // Initialize Micro Interactions
      const microInteractions = MicroInteractions.getInstance();
      
      // Initialize Voice UI
      if (this.config.enableVoiceUI) {
        const voiceUI = VoiceUI.getInstance();
      }
      
      // Initialize Force Touch
      if (this.config.enableForceTouch) {
        const forceTouch = ForceTouchHandler.getInstance();
        forceTouch.setupDefaultPreviews();
      }

      this.status.modules.ui = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ UI components initialized');
    } catch (error) {
      this.handleModuleError('ui', error);
    }
  }

  private async initializeUniqueFeatures(): Promise<void> {
    try {
      // Initialize AI Mood Ring
      const moodRing = AIMoodRing.getInstance();
      
      // Initialize Code Poetry
      const codePoetry = CodePoetry.getInstance();

      this.status.modules.uniqueFeatures = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ Unique features initialized');
    } catch (error) {
      this.handleModuleError('uniqueFeatures', error);
    }
  }

  private async initializeSync(): Promise<void> {
    try {
      const sync = CrossPlatformSync.getInstance();
      
      this.status.modules.sync = {
        initialized: true,
        timestamp: new Date(),
      };
      console.log('✅ Sync initialized');
    } catch (error) {
      this.handleModuleError('sync', error);
    }
  }

  private handleModuleError(moduleName: string, error: any): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.status.modules[moduleName] = {
      initialized: false,
      error: errorMessage,
      timestamp: new Date(),
    };
    this.status.errors.push(`${moduleName}: ${errorMessage}`);
    console.error(`❌ Failed to initialize ${moduleName}:`, error);
  }

  private async saveInitializationStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem('metr_initialization_status', JSON.stringify(this.status));
    } catch (error) {
      console.error('Failed to save initialization status:', error);
    }
  }

  public async loadInitializationStatus(): Promise<InitializationStatus | null> {
    try {
      const saved = await AsyncStorage.getItem('metr_initialization_status');
      if (saved) {
        this.status = JSON.parse(saved);
        return this.status;
      }
    } catch (error) {
      console.error('Failed to load initialization status:', error);
    }
    return null;
  }

  public getStatus(): InitializationStatus {
    return this.status;
  }

  public isInitialized(): boolean {
    return this.status.initialized;
  }

  public getInitializedModules(): string[] {
    return Object.keys(this.status.modules).filter(
      key => this.status.modules[key].initialized
    );
  }

  public getFailedModules(): string[] {
    return Object.keys(this.status.modules).filter(
      key => !this.status.modules[key].initialized
    );
  }

  public async reinitializeModule(moduleName: string): Promise<void> {
    console.log(`Reinitializing module: ${moduleName}`);
    
    switch (moduleName) {
      case 'ai':
        await this.initializeAI();
        break;
      case 'web3':
        await this.initializeWeb3();
        break;
      case 'arvr':
        await this.initializeARVR();
        break;
      case 'quantum':
        await this.initializeQuantum();
        break;
      case 'security':
        await this.initializeSecurity();
        break;
      case 'platformFeatures':
        await this.initializePlatformFeatures();
        break;
      case 'ui':
        await this.initializeUI();
        break;
      case 'uniqueFeatures':
        await this.initializeUniqueFeatures();
        break;
      case 'sync':
        await this.initializeSync();
        break;
      default:
        throw new Error(`Unknown module: ${moduleName}`);
    }
  }
}

// Export singleton instance getter
export const initializeMETR = async (config?: Partial<InitializationConfig>) => {
  const initializer = METRInitializer.getInstance();
  await initializer.initialize(config);
  return initializer;
};

export default METRInitializer;

