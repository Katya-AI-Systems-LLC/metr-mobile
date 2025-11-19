// AccessibilityManager.ts - Accessibility Management for METR
import {AccessibilityInfo} from 'react-native';
import {DeviceEventEmitter} from 'react-native';

interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableHighContrast: boolean;
  enableLargeText: boolean;
  enableReducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
}

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig;
  private isScreenReaderEnabled: boolean = false;
  private isReduceMotionEnabled: boolean = false;

  private constructor() {
    this.config = {
      enableScreenReader: true,
      enableHighContrast: false,
      enableLargeText: false,
      enableReducedMotion: false,
      fontSize: 'medium',
    };

    this.setupAccessibility();
  }

  public static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  private setupAccessibility(): void {
    // Check screen reader
    AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
      this.isScreenReaderEnabled = enabled;
      DeviceEventEmitter.emit('screen_reader_status', {enabled});
    });

    // Check reduce motion
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      this.isReduceMotionEnabled = enabled;
      DeviceEventEmitter.emit('reduce_motion_status', {enabled});
    });

    // Listen for changes
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled: boolean) => {
      this.isScreenReaderEnabled = enabled;
      DeviceEventEmitter.emit('screen_reader_changed', {enabled});
    });

    AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled: boolean) => {
      this.isReduceMotionEnabled = enabled;
      DeviceEventEmitter.emit('reduce_motion_changed', {enabled});
    });
  }

  // Announce to screen reader
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (this.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  // Set accessibility focus
  public setFocus(reactTag: number): void {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }

  // Check if screen reader enabled
  public isScreenReaderActive(): boolean {
    return this.isScreenReaderEnabled;
  }

  // Check if reduce motion enabled
  public isReduceMotionActive(): boolean {
    return this.isReduceMotionEnabled;
  }

  // Configure accessibility
  public configure(config: Partial<AccessibilityConfig>): void {
    this.config = {...this.config, ...config};
    DeviceEventEmitter.emit('accessibility_config_changed', this.config);
  }

  // Get config
  public getConfig(): AccessibilityConfig {
    return {...this.config};
  }
}

export default AccessibilityManager;


