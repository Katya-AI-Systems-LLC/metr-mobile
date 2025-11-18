// BrandingManager.ts - Centralized Brand Management for METR
import {DeviceEventEmitter} from 'react-native';
import {MetrTheme} from '../../theme/metrTheme';

interface BrandAssets {
  logo: {
    primary: string;
    secondary: string;
    icon: string;
    favicon: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    dark: {
      background: string;
      surface: string;
      text: string;
    };
    light: {
      background: string;
      surface: string;
      text: string;
    };
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
  };
  slogans: string[];
  taglines: string[];
}

export class BrandingManager {
  private static instance: BrandingManager;
  private currentBrand: BrandAssets;
  private brandHistory: BrandAssets[] = [];

  private constructor() {
    this.currentBrand = this.getDefaultBrand();
    this.initializeBranding();
  }

  public static getInstance(): BrandingManager {
    if (!BrandingManager.instance) {
      BrandingManager.instance = new BrandingManager();
    }
    return BrandingManager.instance;
  }

  private getDefaultBrand(): BrandAssets {
    return {
      logo: {
        primary: 'METR Logo',
        secondary: 'METR Secondary',
        icon: 'METR Icon',
        favicon: 'METR Favicon',
      },
      colors: {
        primary: MetrTheme.colors.primary.electric, // #8B5CF6
        secondary: MetrTheme.colors.primary.teal, // #14B8A6
        accent: MetrTheme.colors.primary.pink, // #EC4899
        dark: {
          background: MetrTheme.colors.dark.background,
          surface: MetrTheme.colors.dark.surface,
          text: MetrTheme.colors.dark.text,
        },
        light: {
          background: MetrTheme.colors.light.background,
          surface: MetrTheme.colors.light.surface,
          text: MetrTheme.colors.light.text,
        },
      },
      typography: {
        fontFamily: 'System',
        headingFont: 'System',
        bodyFont: 'System',
      },
      slogans: [
        'Measure Your Team\'s Potential',
        'Elevate Your Team',
        'Reach New Heights Together',
        'Climb Higher, Achieve More',
      ],
      taglines: [
        'The future of team collaboration',
        'AI-powered productivity platform',
        'Where teams reach their peak',
        'Modern Enterprise Team Revolution',
      ],
    };
  }

  private initializeBranding(): void {
    // Apply branding to app
    this.applyBranding();
    
    // Listen for branding updates
    DeviceEventEmitter.addListener('branding_update', (newBrand: BrandAssets) => {
      this.updateBrand(newBrand);
    });
  }

  private applyBranding(): void {
    // Emit branding applied event
    DeviceEventEmitter.emit('branding_applied', this.currentBrand);
  }

  public getBrand(): BrandAssets {
    return this.currentBrand;
  }

  public getSlogan(): string {
    return this.currentBrand.slogans[0];
  }

  public getTagline(): string {
    return this.currentBrand.taglines[0];
  }

  public getRandomSlogan(): string {
    const randomIndex = Math.floor(Math.random() * this.currentBrand.slogans.length);
    return this.currentBrand.slogans[randomIndex];
  }

  public getRandomTagline(): string {
    const randomIndex = Math.floor(Math.random() * this.currentBrand.taglines.length);
    return this.currentBrand.taglines[randomIndex];
  }

  public updateBrand(newBrand: Partial<BrandAssets>): void {
    // Save current brand to history
    this.brandHistory.push({...this.currentBrand});
    
    // Update brand
    this.currentBrand = {
      ...this.currentBrand,
      ...newBrand,
    };
    
    // Apply new branding
    this.applyBranding();
    
    // Emit update event
    DeviceEventEmitter.emit('branding_updated', this.currentBrand);
  }

  public resetBrand(): void {
    if (this.brandHistory.length > 0) {
      this.currentBrand = this.brandHistory[this.brandHistory.length - 1];
      this.brandHistory.pop();
      this.applyBranding();
    }
  }

  public getBrandColors(): BrandAssets['colors'] {
    return this.currentBrand.colors;
  }

  public getLogoPath(type: 'primary' | 'secondary' | 'icon' | 'favicon' = 'primary'): string {
    return this.currentBrand.logo[type];
  }

  // Brand guidelines
  public getBrandGuidelines(): {
    logoUsage: string[];
    colorUsage: string[];
    typographyUsage: string[];
    spacing: {small: number; medium: number; large: number};
  } {
    return {
      logoUsage: [
        'Always maintain minimum clear space around logo',
        'Use gradient version for primary applications',
        'Use solid color version for monochrome contexts',
        'Never distort or rotate the logo',
        'Minimum size: 24px',
      ],
      colorUsage: [
        'Primary color (Electric Purple) for main actions and branding',
        'Secondary color (Cyber Teal) for secondary actions and accents',
        'Accent color (Neon Pink) for highlights and CTAs',
        'Dark mode first approach for all interfaces',
        'Maintain sufficient contrast ratios (WCAG AA minimum)',
      ],
      typographyUsage: [
        'Use system fonts for optimal performance',
        'Headings: Bold, 24-32px',
        'Body: Regular, 16px',
        'Captions: Regular, 12-14px',
        'Maintain consistent line heights (1.5x font size)',
      ],
      spacing: {
        small: 8,
        medium: 16,
        large: 24,
      },
    };
  }
}

export default BrandingManager;

