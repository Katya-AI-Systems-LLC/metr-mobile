// ThemeManager.ts - Advanced Theme Management for METR
import {DeviceEventEmitter, Appearance, ColorSchemeName} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MetrTheme} from '../../theme/metrTheme';

type ThemeMode = 'light' | 'dark' | 'auto';
type ThemeVariant = 'default' | 'high-contrast' | 'colorblind' | 'custom';

interface ThemeConfig {
  mode: ThemeMode;
  variant: ThemeVariant;
  customColors?: Record<string, string>;
  enableAnimations: boolean;
  enableTransitions: boolean;
}

export class ThemeManager {
  private static instance: ThemeManager;
  private config: ThemeConfig;
  private currentTheme: typeof MetrTheme;
  private systemColorScheme: ColorSchemeName;

  private constructor() {
    this.config = {
      mode: 'auto',
      variant: 'default',
      enableAnimations: true,
      enableTransitions: true,
    };

    this.systemColorScheme = Appearance.getColorScheme();
    this.currentTheme = MetrTheme;
    this.setupTheme();
    this.loadTheme();
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private setupTheme(): void {
    // Listen for system theme changes
    Appearance.addChangeListener(({colorScheme}) => {
      this.systemColorScheme = colorScheme;
      if (this.config.mode === 'auto') {
        this.applyTheme();
      }
    });
  }

  // Load saved theme
  private async loadTheme(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem('theme_config');
      if (savedConfig) {
        this.config = {...this.config, ...JSON.parse(savedConfig)};
      }
      this.applyTheme();
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }

  // Apply theme
  private applyTheme(): void {
    const effectiveMode = this.config.mode === 'auto' 
      ? (this.systemColorScheme || 'dark')
      : this.config.mode;

    // Apply theme based on mode and variant
    DeviceEventEmitter.emit('theme_changed', {
      mode: effectiveMode,
      variant: this.config.variant,
      theme: this.currentTheme,
    });
  }

  // Set theme mode
  public async setMode(mode: ThemeMode): Promise<void> {
    this.config.mode = mode;
    await this.saveTheme();
    this.applyTheme();
  }

  // Set theme variant
  public async setVariant(variant: ThemeVariant): Promise<void> {
    this.config.variant = variant;
    await this.saveTheme();
    this.applyTheme();
  }

  // Set custom colors
  public async setCustomColors(colors: Record<string, string>): Promise<void> {
    this.config.customColors = colors;
    await this.saveTheme();
    this.applyTheme();
  }

  // Get current theme
  public getTheme(): typeof MetrTheme {
    return this.currentTheme;
  }

  // Get effective mode
  public getEffectiveMode(): 'light' | 'dark' {
    if (this.config.mode === 'auto') {
      return (this.systemColorScheme || 'dark') as 'light' | 'dark';
    }
    return this.config.mode;
  }

  // Save theme
  private async saveTheme(): Promise<void> {
    try {
      await AsyncStorage.setItem('theme_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  // Configure theme
  public configure(config: Partial<ThemeConfig>): void {
    this.config = {...this.config, ...config};
    this.applyTheme();
  }
}

export default ThemeManager;


