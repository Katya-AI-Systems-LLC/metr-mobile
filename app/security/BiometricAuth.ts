// BiometricAuth.ts - Biometric Authentication for METR
import {NativeModules, Platform} from 'react-native';
import TouchID from 'react-native-touch-id';
import FaceID from 'react-native-faceId';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export type BiometricType = 'TouchID' | 'FaceID' | 'Fingerprint' | 'Face' | 'Iris' | 'None';

interface BiometricConfig {
  title: string;
  subtitle?: string;
  description?: string;
  fallbackLabel?: string;
  cancelLabel?: string;
  maxAttempts?: number;
  requireConfirmation?: boolean;
}

interface BiometricStatus {
  isAvailable: boolean;
  biometryType: BiometricType;
  isEnrolled: boolean;
  hasHardware: boolean;
  error?: string;
}

interface SecureCredentials {
  username: string;
  password: string;
  token?: string;
  biometricEnabled: boolean;
  lastAuthenticated?: Date;
}

export class BiometricAuth {
  private static instance: BiometricAuth;
  private biometricStatus: BiometricStatus | null = null;
  private failedAttempts: number = 0;
  private readonly MAX_FAILED_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
  private lockoutEndTime: Date | null = null;

  private constructor() {
    this.checkBiometricSupport();
  }

  public static getInstance(): BiometricAuth {
    if (!BiometricAuth.instance) {
      BiometricAuth.instance = new BiometricAuth();
    }
    return BiometricAuth.instance;
  }

  // Check device biometric capabilities
  private async checkBiometricSupport(): Promise<void> {
    try {
      let biometryType: BiometricType = 'None';
      let isAvailable = false;
      let isEnrolled = false;
      let hasHardware = false;

      if (Platform.OS === 'ios') {
        // iOS biometric check
        try {
          const biometryTypeIOS = await TouchID.isSupported();
          hasHardware = true;
          isAvailable = true;
          
          if (biometryTypeIOS === 'FaceID') {
            biometryType = 'FaceID';
          } else if (biometryTypeIOS === 'TouchID') {
            biometryType = 'TouchID';
          }
          
          // Check if user has enrolled biometrics
          isEnrolled = await this.checkEnrollment();
        } catch (error: any) {
          if (error.code === 'BiometricsNotEnrolled') {
            hasHardware = true;
            isEnrolled = false;
          }
        }
      } else if (Platform.OS === 'android') {
        // Android biometric check
        const BiometricModule = NativeModules.BiometricModule;
        if (BiometricModule) {
          const status = await BiometricModule.checkBiometricSupport();
          hasHardware = status.hasHardware;
          isAvailable = status.isAvailable;
          isEnrolled = status.isEnrolled;
          biometryType = status.biometryType || 'Fingerprint';
        }
      }

      this.biometricStatus = {
        isAvailable,
        biometryType,
        isEnrolled,
        hasHardware,
      };
    } catch (error) {
      console.error('Failed to check biometric support:', error);
      this.biometricStatus = {
        isAvailable: false,
        biometryType: 'None',
        isEnrolled: false,
        hasHardware: false,
        error: error.message,
      };
    }
  }

  // Check if biometrics are enrolled
  private async checkEnrollment(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        await TouchID.authenticate('Check enrollment', {
          passcodeFallback: false,
        });
        return true;
      } else {
        const BiometricModule = NativeModules.BiometricModule;
        if (BiometricModule) {
          return await BiometricModule.hasEnrolledFingerprints();
        }
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  // Get current biometric status
  public getBiometricStatus(): BiometricStatus | null {
    return this.biometricStatus;
  }

  // Authenticate user with biometrics
  public async authenticate(config?: BiometricConfig): Promise<boolean> {
    // Check if locked out
    if (this.isLockedOut()) {
      throw new Error(`Too many failed attempts. Try again in ${this.getRemainingLockoutTime()} seconds.`);
    }

    if (!this.biometricStatus?.isAvailable) {
      throw new Error('Biometric authentication not available');
    }

    if (!this.biometricStatus?.isEnrolled) {
      throw new Error('No biometric data enrolled. Please set up biometrics in device settings.');
    }

    const defaultConfig: BiometricConfig = {
      title: 'METR Authentication',
      subtitle: 'Verify your identity to continue',
      description: 'Place your finger on the sensor or look at the camera',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      ...config,
    };

    try {
      let success = false;

      if (Platform.OS === 'ios') {
        success = await this.authenticateIOS(defaultConfig);
      } else if (Platform.OS === 'android') {
        success = await this.authenticateAndroid(defaultConfig);
      }

      if (success) {
        this.failedAttempts = 0;
        await this.logAuthenticationSuccess();
        return true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      this.handleAuthenticationFailure(error);
      throw error;
    }
  }

  // iOS authentication
  private async authenticateIOS(config: BiometricConfig): Promise<boolean> {
    try {
      await TouchID.authenticate(config.description || '', {
        title: config.title,
        fallbackLabel: config.fallbackLabel,
        passcodeFallback: true,
      });
      return true;
    } catch (error: any) {
      if (error.code === 'UserCancel' || error.code === 'SystemCancel') {
        throw new Error('Authentication cancelled');
      } else if (error.code === 'UserFallback') {
        // Handle passcode fallback
        return await this.handlePasscodeFallback();
      }
      throw error;
    }
  }

  // Android authentication
  private async authenticateAndroid(config: BiometricConfig): Promise<boolean> {
    try {
      const BiometricModule = NativeModules.BiometricModule;
      if (!BiometricModule) {
        throw new Error('Biometric module not available');
      }

      const result = await BiometricModule.authenticate({
        title: config.title,
        subtitle: config.subtitle,
        description: config.description,
        cancelLabel: config.cancelLabel,
        requireConfirmation: config.requireConfirmation ?? false,
      });

      return result.success;
    } catch (error: any) {
      if (error.code === 'USER_CANCELLED') {
        throw new Error('Authentication cancelled');
      }
      throw error;
    }
  }

  // Handle passcode fallback
  private async handlePasscodeFallback(): Promise<boolean> {
    // This would integrate with device passcode
    // For now, return false to require biometric
    return false;
  }

  // Handle authentication failure
  private handleAuthenticationFailure(error: any): void {
    this.failedAttempts++;
    
    if (this.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      this.lockoutEndTime = new Date(Date.now() + this.LOCKOUT_DURATION);
      this.failedAttempts = 0;
    }

    console.error('Biometric authentication failed:', error);
  }

  // Check if currently locked out
  private isLockedOut(): boolean {
    if (!this.lockoutEndTime) return false;
    return Date.now() < this.lockoutEndTime.getTime();
  }

  // Get remaining lockout time in seconds
  private getRemainingLockoutTime(): number {
    if (!this.lockoutEndTime) return 0;
    const remaining = this.lockoutEndTime.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  // Store credentials securely with biometric protection
  public async storeSecureCredentials(credentials: SecureCredentials): Promise<void> {
    try {
      // Authenticate first
      const authenticated = await this.authenticate({
        title: 'Save Credentials',
        description: 'Authenticate to save your credentials securely',
      });

      if (!authenticated) {
        throw new Error('Authentication required to save credentials');
      }

      // Store in secure keychain
      await Keychain.setInternetCredentials(
        'metr.app',
        credentials.username,
        credentials.password,
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          authenticatePrompt: 'Access your credentials',
          authenticationPrompt: {
            title: 'METR Credentials',
            subtitle: 'Access stored credentials',
          },
        }
      );

      // Store additional data
      await AsyncStorage.setItem('secure_credentials_meta', JSON.stringify({
        username: credentials.username,
        biometricEnabled: true,
        lastAuthenticated: new Date(),
      }));
    } catch (error) {
      console.error('Failed to store secure credentials:', error);
      throw error;
    }
  }

  // Retrieve credentials with biometric authentication
  public async retrieveSecureCredentials(): Promise<SecureCredentials | null> {
    try {
      // Authenticate first
      const authenticated = await this.authenticate({
        title: 'Access Credentials',
        description: 'Authenticate to access your stored credentials',
      });

      if (!authenticated) {
        throw new Error('Authentication required to access credentials');
      }

      // Retrieve from keychain
      const credentials = await Keychain.getInternetCredentials('metr.app');
      
      if (!credentials) {
        return null;
      }

      // Get metadata
      const metaData = await AsyncStorage.getItem('secure_credentials_meta');
      const meta = metaData ? JSON.parse(metaData) : {};

      return {
        username: credentials.username,
        password: credentials.password,
        biometricEnabled: meta.biometricEnabled ?? false,
        lastAuthenticated: meta.lastAuthenticated ? new Date(meta.lastAuthenticated) : undefined,
      };
    } catch (error) {
      console.error('Failed to retrieve secure credentials:', error);
      return null;
    }
  }

  // Clear stored credentials
  public async clearCredentials(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('metr.app');
      await AsyncStorage.removeItem('secure_credentials_meta');
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }

  // Enable biometric lock for app
  public async enableBiometricLock(): Promise<boolean> {
    if (!this.biometricStatus?.isAvailable) {
      throw new Error('Biometric authentication not available');
    }

    try {
      const authenticated = await this.authenticate({
        title: 'Enable Biometric Lock',
        description: 'Authenticate to enable biometric lock for METR',
      });

      if (authenticated) {
        await AsyncStorage.setItem('biometric_lock_enabled', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to enable biometric lock:', error);
      return false;
    }
  }

  // Check if biometric lock is enabled
  public async isBiometricLockEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('biometric_lock_enabled');
    return enabled === 'true';
  }

  // Authenticate for sensitive operations
  public async authenticateForOperation(operation: string): Promise<boolean> {
    return await this.authenticate({
      title: 'Confirm Action',
      subtitle: operation,
      description: 'Authenticate to confirm this action',
      requireConfirmation: true,
    });
  }

  // Log successful authentication
  private async logAuthenticationSuccess(): Promise<void> {
    const log = {
      timestamp: new Date(),
      biometryType: this.biometricStatus?.biometryType,
      device: Platform.OS,
    };

    const logs = await AsyncStorage.getItem('auth_logs');
    const authLogs = logs ? JSON.parse(logs) : [];
    authLogs.push(log);

    // Keep only last 100 logs
    if (authLogs.length > 100) {
      authLogs.shift();
    }

    await AsyncStorage.setItem('auth_logs', JSON.stringify(authLogs));
  }

  // Get authentication history
  public async getAuthenticationHistory(): Promise<any[]> {
    const logs = await AsyncStorage.getItem('auth_logs');
    return logs ? JSON.parse(logs) : [];
  }

  // Multi-factor authentication with biometrics
  public async performMFA(factors: string[]): Promise<boolean> {
    let authenticated = false;

    for (const factor of factors) {
      switch (factor) {
        case 'biometric':
          authenticated = await this.authenticate();
          break;
        case 'pin':
          // Implement PIN authentication
          break;
        case 'pattern':
          // Implement pattern authentication
          break;
        default:
          break;
      }

      if (!authenticated) {
        return false;
      }
    }

    return authenticated;
  }
}

export default BiometricAuth;
