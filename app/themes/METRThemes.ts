// METRThemes.ts - Additional METR Branded Themes
import {MetrTheme} from '../theme/metrTheme';

export const METRThemes = {
  // Purple Theme
  purple: {
    ...MetrTheme,
    colors: {
      ...MetrTheme.colors,
      primary: {
        electric: '#8B5CF6',
        teal: '#A78BFA',
        pink: '#C084FC',
      },
      gradients: {
        primary: ['#8B5CF6', '#C084FC'],
        secondary: ['#7C3AED', '#8B5CF6'],
        accent: ['#C084FC', '#E879F9'],
      },
    },
  },

  // Teal Theme
  teal: {
    ...MetrTheme,
    colors: {
      ...MetrTheme.colors,
      primary: {
        electric: '#14B8A6',
        teal: '#2DD4BF',
        pink: '#5EEAD4',
      },
      gradients: {
        primary: ['#14B8A6', '#5EEAD4'],
        secondary: ['#0D9488', '#14B8A6'],
        accent: ['#5EEAD4', '#99F6E4'],
      },
    },
  },

  // Pink Theme
  pink: {
    ...MetrTheme,
    colors: {
      ...MetrTheme.colors,
      primary: {
        electric: '#EC4899',
        teal: '#F472B6',
        pink: '#F9A8D4',
      },
      gradients: {
        primary: ['#EC4899', '#F9A8D4'],
        secondary: ['#DB2777', '#EC4899'],
        accent: ['#F9A8D4', '#FBCFE8'],
      },
    },
  },

  // Dark Purple Theme
  darkPurple: {
    ...MetrTheme,
    colors: {
      ...MetrTheme.colors,
      dark: {
        background: '#0A0A0F',
        surface: '#151520',
        surfaceLight: '#1F1F2E',
        text: '#FFFFFF',
        textSecondary: '#A3A3A3',
        border: 'rgba(139, 92, 246, 0.2)',
      },
      primary: {
        electric: '#8B5CF6',
        teal: '#A78BFA',
        pink: '#C084FC',
      },
    },
  },

  // High Contrast Theme
  highContrast: {
    ...MetrTheme,
    colors: {
      ...MetrTheme.colors,
      dark: {
        background: '#000000',
        surface: '#1A1A1A',
        surfaceLight: '#2A2A2A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        border: 'rgba(255, 255, 255, 0.3)',
      },
    },
  },
};

export default METRThemes;

