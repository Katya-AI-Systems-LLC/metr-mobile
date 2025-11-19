// I18nManager.ts - Advanced Internationalization Manager for METR
import {DeviceEventEmitter} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage: string;
  enableAutoDetect: boolean;
  enableRTL: boolean;
  availableLanguages: Language[];
}

export class I18nManager {
  private static instance: I18nManager;
  private config: I18nConfig;
  private currentLanguage: string;
  private translations: Map<string, Record<string, string>> = new Map();

  private constructor() {
    this.config = {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      enableAutoDetect: true,
      enableRTL: false,
      availableLanguages: [
        {code: 'en', name: 'English', nativeName: 'English', rtl: false},
        {code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false},
        {code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false},
        {code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false},
        {code: 'fr', name: 'French', nativeName: 'Français', rtl: false},
      ],
    };

    this.currentLanguage = this.detectLanguage();
    this.loadTranslations();
  }

  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  // Detect language
  private detectLanguage(): string {
    if (this.config.enableAutoDetect) {
      const locales = RNLocalize.getLocales();
      if (locales.length > 0) {
        const languageCode = locales[0].languageCode;
        const available = this.config.availableLanguages.find(lang => lang.code === languageCode);
        if (available) {
          return languageCode;
        }
      }
    }

    return this.config.defaultLanguage;
  }

  // Load translations
  private async loadTranslations(): Promise<void> {
    try {
      // Load saved language preference
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        this.currentLanguage = savedLanguage;
      }

      // Load translations for current language
      await this.loadLanguageTranslations(this.currentLanguage);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  // Load language translations
  private async loadLanguageTranslations(languageCode: string): Promise<void> {
    try {
      // In production, load from files or API
      // For now, use empty translations
      const translations: Record<string, string> = {};
      this.translations.set(languageCode, translations);
    } catch (error) {
      console.error(`Failed to load translations for ${languageCode}:`, error);
    }
  }

  // Translate
  public t(key: string, params?: Record<string, string>): string {
    const translations = this.translations.get(this.currentLanguage) || {};
    let translation = translations[key] || key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }

    return translation;
  }

  // Change language
  public async setLanguage(languageCode: string): Promise<void> {
    if (!this.config.availableLanguages.find(lang => lang.code === languageCode)) {
      console.warn(`Language ${languageCode} not available`);
      return;
    }

    this.currentLanguage = languageCode;
    await AsyncStorage.setItem('app_language', languageCode);
    await this.loadLanguageTranslations(languageCode);

    DeviceEventEmitter.emit('language_changed', {
      language: languageCode,
      rtl: this.isRTL(),
    });
  }

  // Get current language
  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Check if RTL
  public isRTL(): boolean {
    const language = this.config.availableLanguages.find(lang => lang.code === this.currentLanguage);
    return language?.rtl || false;
  }

  // Get available languages
  public getAvailableLanguages(): Language[] {
    return [...this.config.availableLanguages];
  }

  // Configure i18n
  public configure(config: Partial<I18nConfig>): void {
    this.config = {...this.config, ...config};
  }
}

export default I18nManager;


