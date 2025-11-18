// DynamicThemes.ts - Dynamic Theme System for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter, Appearance} from 'react-native';

interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'auto';
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  animations: AnimationConfig;
  sounds: SoundConfig;
  customizations: ThemeCustomization;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  border: string;
  shadow: string;
  overlay: string;
  gradients: Gradient[];
}

interface Gradient {
  name: string;
  colors: string[];
  angle: number;
}

interface Typography {
  fontFamily: string;
  sizes: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    button: number;
  };
  weights: {
    light: string;
    regular: string;
    medium: string;
    bold: string;
  };
  lineHeights: Record<string, number>;
}

interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

interface AnimationConfig {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: string;
  scale: number;
}

interface SoundConfig {
  enabled: boolean;
  volume: number;
  effects: Record<string, string>;
}

interface ThemeCustomization {
  borderRadius: number;
  shadowIntensity: number;
  glassmorphism: boolean;
  parallax: boolean;
  particles: boolean;
}

interface TimeBasedTheme {
  timeRange: {start: number; end: number};
  theme: Theme;
  transition: 'instant' | 'smooth';
}

interface ContextualTheme {
  context: string;
  conditions: ThemeCondition[];
  theme: Partial<Theme>;
}

interface ThemeCondition {
  type: 'location' | 'activity' | 'weather' | 'calendar' | 'battery';
  value: any;
  operator: '==' | '!=' | '>' | '<' | 'contains';
}

export class DynamicThemes {
  private static instance: DynamicThemes;
  private currentTheme: Theme;
  private themes: Map<string, Theme> = new Map();
  private timeBasedThemes: TimeBasedTheme[] = [];
  private contextualThemes: ContextualTheme[] = [];
  private customThemes: Map<string, Theme> = new Map();
  private themeHistory: string[] = [];
  private isAutoMode: boolean = true;
  private currentContext: any = {};
  
  private constructor() {
    this.currentTheme = this.getDefaultTheme();
    this.initialize();
  }

  public static getInstance(): DynamicThemes {
    if (!DynamicThemes.instance) {
      DynamicThemes.instance = new DynamicThemes();
    }
    return DynamicThemes.instance;
  }

  private async initialize() {
    this.setupDefaultThemes();
    await this.loadCustomThemes();
    this.setupTimeBasedThemes();
    this.setupContextualThemes();
    this.startDynamicTheming();
    this.setupEventListeners();
  }

  private getDefaultTheme(): Theme {
    return {
      id: 'metr_default',
      name: 'METR Default',
      type: 'dark',
      colors: {
        primary: '#8B5CF6',
        secondary: '#14B8A6',
        accent: '#EC4899',
        background: '#0F0F1E',
        surface: '#1A1A2E',
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
        border: '#2D2D44',
        shadow: '#000000',
        overlay: 'rgba(0, 0, 0, 0.7)',
        gradients: [
          {name: 'primary', colors: ['#8B5CF6', '#EC4899'], angle: 45},
          {name: 'surface', colors: ['#1A1A2E', '#0F0F1E'], angle: 180},
        ],
      },
      typography: {
        fontFamily: 'Inter',
        sizes: {h1: 32, h2: 24, h3: 20, body: 16, caption: 12, button: 16},
        weights: {light: '300', regular: '400', medium: '500', bold: '700'},
        lineHeights: {h1: 1.2, h2: 1.3, h3: 1.4, body: 1.5, caption: 1.4},
      },
      spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48},
      animations: {
        duration: {fast: 200, normal: 300, slow: 500},
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        scale: 1,
      },
      sounds: {
        enabled: true,
        volume: 0.5,
        effects: {tap: 'tap.wav', success: 'success.wav', error: 'error.wav'},
      },
      customizations: {
        borderRadius: 12,
        shadowIntensity: 0.3,
        glassmorphism: true,
        parallax: false,
        particles: false,
      },
    };
  }

  private setupDefaultThemes() {
    // Light Theme
    const lightTheme: Theme = {
      ...this.getDefaultTheme(),
      id: 'light',
      name: 'Day Light',
      type: 'light',
      colors: {
        ...this.getDefaultTheme().colors,
        background: '#FFFFFF',
        surface: '#F3F4F6',
        text: '#1F2937',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        shadow: '#9CA3AF',
        overlay: 'rgba(0, 0, 0, 0.3)',
      },
    };

    // Cyber Theme
    const cyberTheme: Theme = {
      ...this.getDefaultTheme(),
      id: 'cyber',
      name: 'Cyberpunk',
      colors: {
        ...this.getDefaultTheme().colors,
        primary: '#00FFFF',
        secondary: '#FF00FF',
        accent: '#FFFF00',
        background: '#000033',
        surface: '#000066',
        gradients: [
          {name: 'neon', colors: ['#00FFFF', '#FF00FF', '#FFFF00'], angle: 90},
        ],
      },
      customizations: {
        ...this.getDefaultTheme().customizations,
        glassmorphism: false,
        particles: true,
      },
    };

    // Nature Theme
    const natureTheme: Theme = {
      ...this.getDefaultTheme(),
      id: 'nature',
      name: 'Natural',
      colors: {
        ...this.getDefaultTheme().colors,
        primary: '#059669',
        secondary: '#84CC16',
        accent: '#F59E0B',
        background: '#F0FDF4',
        surface: '#DCFCE7',
        text: '#064E3B',
        textSecondary: '#059669',
      },
    };

    // Minimal Theme
    const minimalTheme: Theme = {
      ...this.getDefaultTheme(),
      id: 'minimal',
      name: 'Minimalist',
      type: 'light',
      colors: {
        ...this.getDefaultTheme().colors,
        primary: '#000000',
        secondary: '#666666',
        accent: '#000000',
        background: '#FFFFFF',
        surface: '#FAFAFA',
        text: '#000000',
        textSecondary: '#666666',
        border: '#E0E0E0',
      },
      customizations: {
        ...this.getDefaultTheme().customizations,
        borderRadius: 0,
        glassmorphism: false,
        shadowIntensity: 0,
      },
    };

    this.themes.set('light', lightTheme);
    this.themes.set('cyber', cyberTheme);
    this.themes.set('nature', natureTheme);
    this.themes.set('minimal', minimalTheme);
  }

  private setupTimeBasedThemes() {
    // Morning theme (6am - 12pm)
    this.timeBasedThemes.push({
      timeRange: {start: 6, end: 12},
      theme: this.themes.get('light')!,
      transition: 'smooth',
    });

    // Afternoon theme (12pm - 5pm)
    this.timeBasedThemes.push({
      timeRange: {start: 12, end: 17},
      theme: {
        ...this.themes.get('light')!,
        colors: {
          ...this.themes.get('light')!.colors,
          primary: '#F59E0B', // Warmer afternoon colors
        },
      },
      transition: 'smooth',
    });

    // Evening theme (5pm - 9pm)
    this.timeBasedThemes.push({
      timeRange: {start: 17, end: 21},
      theme: {
        ...this.getDefaultTheme(),
        colors: {
          ...this.getDefaultTheme().colors,
          background: '#1A1A2E',
          primary: '#EC4899', // Sunset colors
        },
      },
      transition: 'smooth',
    });

    // Night theme (9pm - 6am)
    this.timeBasedThemes.push({
      timeRange: {start: 21, end: 6},
      theme: {
        ...this.getDefaultTheme(),
        colors: {
          ...this.getDefaultTheme().colors,
          background: '#000000',
          surface: '#0A0A0F',
        },
        customizations: {
          ...this.getDefaultTheme().customizations,
          shadowIntensity: 0.1, // Reduced shadows at night
        },
      },
      transition: 'smooth',
    });
  }

  private setupContextualThemes() {
    // Focus mode theme
    this.contextualThemes.push({
      context: 'focus',
      conditions: [{type: 'activity', value: 'focus', operator: '=='}],
      theme: {
        colors: {
          primary: '#6366F1',
          background: '#0F172A',
        },
        sounds: {
          enabled: false,
          volume: 0,
          effects: {},
        },
        customizations: {
          particles: false,
          glassmorphism: false,
        },
      },
    });

    // Low battery theme
    this.contextualThemes.push({
      context: 'battery_saver',
      conditions: [{type: 'battery', value: 20, operator: '<'}],
      theme: {
        colors: {
          background: '#000000',
          surface: '#0A0A0A',
        },
        animations: {
          duration: {fast: 0, normal: 0, slow: 0},
          easing: 'linear',
          scale: 0,
        },
        customizations: {
          particles: false,
          parallax: false,
          glassmorphism: false,
        },
      },
    });

    // Weather-based themes
    this.contextualThemes.push({
      context: 'rainy',
      conditions: [{type: 'weather', value: 'rain', operator: 'contains'}],
      theme: {
        colors: {
          primary: '#475569',
          background: '#1E293B',
          accent: '#64748B',
        },
        sounds: {
          enabled: true,
          volume: 0.3,
          effects: {ambient: 'rain.wav'},
        },
      },
    });

    // Holiday themes
    this.contextualThemes.push({
      context: 'holiday',
      conditions: [{type: 'calendar', value: 'holiday', operator: 'contains'}],
      theme: {
        colors: {
          primary: '#DC2626',
          secondary: '#16A34A',
          accent: '#EAB308',
        },
        customizations: {
          particles: true,
        },
      },
    });
  }

  private setupEventListeners() {
    DeviceEventEmitter.addListener('theme_change_request', this.handleThemeChange.bind(this));
    DeviceEventEmitter.addListener('context_update', this.updateContext.bind(this));
    Appearance.addChangeListener(this.handleSystemThemeChange.bind(this));
  }

  // Dynamic Theme Management
  private startDynamicTheming() {
    // Check theme every minute
    setInterval(() => {
      if (this.isAutoMode) {
        this.updateThemeBasedOnContext();
      }
    }, 60000);

    // Initial theme set
    this.updateThemeBasedOnContext();
  }

  private updateThemeBasedOnContext() {
    let newTheme: Theme | null = null;

    // Check time-based themes
    const hour = new Date().getHours();
    for (const timeTheme of this.timeBasedThemes) {
      if (this.isInTimeRange(hour, timeTheme.timeRange)) {
        newTheme = timeTheme.theme;
        break;
      }
    }

    // Check contextual themes (override time-based)
    for (const contextTheme of this.contextualThemes) {
      if (this.matchesConditions(contextTheme.conditions)) {
        newTheme = this.mergeThemes(newTheme || this.currentTheme, contextTheme.theme);
        break;
      }
    }

    // Apply theme if changed
    if (newTheme && newTheme.id !== this.currentTheme.id) {
      this.applyTheme(newTheme, true);
    }
  }

  private isInTimeRange(hour: number, range: {start: number; end: number}): boolean {
    if (range.start <= range.end) {
      return hour >= range.start && hour < range.end;
    } else {
      // Handle overnight ranges (e.g., 21-6)
      return hour >= range.start || hour < range.end;
    }
  }

  private matchesConditions(conditions: ThemeCondition[]): boolean {
    return conditions.every(condition => {
      const contextValue = this.currentContext[condition.type];
      
      switch (condition.operator) {
        case '==': return contextValue === condition.value;
        case '!=': return contextValue !== condition.value;
        case '>': return contextValue > condition.value;
        case '<': return contextValue < condition.value;
        case 'contains': return contextValue?.includes(condition.value);
        default: return false;
      }
    });
  }

  private mergeThemes(base: Theme, override: Partial<Theme>): Theme {
    return {
      ...base,
      ...override,
      colors: {...base.colors, ...(override.colors || {})},
      typography: {...base.typography, ...(override.typography || {})},
      spacing: {...base.spacing, ...(override.spacing || {})},
      animations: {...base.animations, ...(override.animations || {})},
      sounds: {...base.sounds, ...(override.sounds || {})},
      customizations: {...base.customizations, ...(override.customizations || {})},
    };
  }

  // Theme Application
  public applyTheme(theme: Theme, animated: boolean = true): void {
    this.themeHistory.push(this.currentTheme.id);
    
    if (animated) {
      this.animateThemeTransition(this.currentTheme, theme);
    } else {
      this.currentTheme = theme;
      this.emitThemeChange();
    }
    
    this.saveCurrentTheme();
  }

  private animateThemeTransition(fromTheme: Theme, toTheme: Theme): void {
    // Gradual color transition
    const steps = 30;
    const interval = 10;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      const interpolatedTheme = this.interpolateThemes(fromTheme, toTheme, progress);
      this.currentTheme = interpolatedTheme;
      this.emitThemeChange();
      
      if (currentStep >= steps) {
        clearInterval(timer);
        this.currentTheme = toTheme;
        this.emitThemeChange();
      }
    }, interval);
  }

  private interpolateThemes(from: Theme, to: Theme, progress: number): Theme {
    return {
      ...to,
      colors: this.interpolateColors(from.colors, to.colors, progress),
      customizations: {
        ...to.customizations,
        shadowIntensity: from.customizations.shadowIntensity + 
          (to.customizations.shadowIntensity - from.customizations.shadowIntensity) * progress,
      },
    };
  }

  private interpolateColors(from: ColorPalette, to: ColorPalette, progress: number): ColorPalette {
    const interpolateColor = (color1: string, color2: string): string => {
      // Simple hex color interpolation
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
      
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);
      
      const r = Math.round(r1 + (r2 - r1) * progress);
      const g = Math.round(g1 + (g2 - g1) * progress);
      const b = Math.round(b1 + (b2 - b1) * progress);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    return {
      ...to,
      primary: interpolateColor(from.primary, to.primary),
      secondary: interpolateColor(from.secondary, to.secondary),
      accent: interpolateColor(from.accent, to.accent),
      background: interpolateColor(from.background, to.background),
      surface: interpolateColor(from.surface, to.surface),
    };
  }

  private emitThemeChange(): void {
    DeviceEventEmitter.emit('theme_changed', this.currentTheme);
  }

  // Event Handlers
  private handleThemeChange(themeId: string): void {
    const theme = this.themes.get(themeId) || this.customThemes.get(themeId);
    if (theme) {
      this.isAutoMode = false;
      this.applyTheme(theme);
    }
  }

  private updateContext(context: any): void {
    this.currentContext = {...this.currentContext, ...context};
    if (this.isAutoMode) {
      this.updateThemeBasedOnContext();
    }
  }

  private handleSystemThemeChange(): void {
    if (this.isAutoMode) {
      const systemTheme = Appearance.getColorScheme();
      const theme = systemTheme === 'dark' ? this.getDefaultTheme() : this.themes.get('light')!;
      this.applyTheme(theme);
    }
  }

  // Custom Theme Creation
  public createCustomTheme(name: string, baseThemeId: string, customizations: Partial<Theme>): Theme {
    const baseTheme = this.themes.get(baseThemeId) || this.currentTheme;
    const customTheme: Theme = {
      ...baseTheme,
      id: `custom_${Date.now()}`,
      name,
      ...customizations,
    };
    
    this.customThemes.set(customTheme.id, customTheme);
    this.saveCustomThemes();
    
    return customTheme;
  }

  // Persistence
  private async saveCurrentTheme(): Promise<void> {
    try {
      await AsyncStorage.setItem('current_theme', JSON.stringify(this.currentTheme));
      await AsyncStorage.setItem('theme_auto_mode', JSON.stringify(this.isAutoMode));
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  private async loadCustomThemes(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('custom_themes');
      if (saved) {
        const themes = JSON.parse(saved);
        Object.entries(themes).forEach(([id, theme]) => {
          this.customThemes.set(id, theme as Theme);
        });
      }
    } catch (error) {
      console.error('Failed to load custom themes:', error);
    }
  }

  private async saveCustomThemes(): Promise<void> {
    try {
      const themes: Record<string, Theme> = {};
      this.customThemes.forEach((theme, id) => {
        themes[id] = theme;
      });
      await AsyncStorage.setItem('custom_themes', JSON.stringify(themes));
    } catch (error) {
      console.error('Failed to save custom themes:', error);
    }
  }

  // Public API
  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  public getAvailableThemes(): Theme[] {
    return [
      ...Array.from(this.themes.values()),
      ...Array.from(this.customThemes.values()),
    ];
  }

  public setAutoMode(enabled: boolean): void {
    this.isAutoMode = enabled;
    if (enabled) {
      this.updateThemeBasedOnContext();
    }
  }

  public getThemeHistory(): string[] {
    return this.themeHistory;
  }

  public revertToPreviousTheme(): void {
    if (this.themeHistory.length > 0) {
      const previousId = this.themeHistory.pop()!;
      const theme = this.themes.get(previousId) || this.customThemes.get(previousId);
      if (theme) {
        this.applyTheme(theme);
      }
    }
  }
}
