// metrTheme.ts - Modern theme configuration for METR
export const MetrTheme = {
  colors: {
    // Primary Brand Colors
    primary: {
      electric: '#8B5CF6', // Electric Purple
      teal: '#14B8A6', // Cyber Teal
      pink: '#EC4899', // Neon Pink
    },
    
    // Gradient Combinations
    gradients: {
      primary: ['#8B5CF6', '#EC4899'],
      secondary: ['#14B8A6', '#8B5CF6'],
      accent: ['#EC4899', '#F97316'],
      dark: ['#1F2937', '#111827'],
      light: ['#F3F4F6', '#FFFFFF'],
      glass: ['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)'],
    },
    
    // Semantic Colors
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    
    // Dark Mode Colors
    dark: {
      background: '#0F0F0F',
      surface: '#1A1A1A',
      surfaceLight: '#262626',
      text: '#FFFFFF',
      textSecondary: '#A3A3A3',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    
    // Light Mode Colors
    light: {
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceLight: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      border: 'rgba(0, 0, 0, 0.1)',
    },
    
    // Glassmorphism Effects
    glass: {
      lightBlur: 'rgba(255, 255, 255, 0.1)',
      darkBlur: 'rgba(0, 0, 0, 0.3)',
      purpleBlur: 'rgba(139, 92, 246, 0.15)',
      tealBlur: 'rgba(20, 184, 166, 0.15)',
    },
  },
  
  typography: {
    // Font Families
    fonts: {
      primary: 'Inter',
      secondary: 'Space Grotesk',
      mono: 'JetBrains Mono',
    },
    
    // Font Sizes
    sizes: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    
    // Font Weights
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    
    // Line Heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },
  
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 20},
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 12,
    },
    glow: {
      shadowColor: '#8B5CF6',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  
  animations: {
    durations: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 1000,
    },
    
    easings: {
      linear: [0, 0, 1, 1],
      ease: [0.25, 0.1, 0.25, 1],
      easeIn: [0.42, 0, 1, 1],
      easeOut: [0, 0, 0.58, 1],
      easeInOut: [0.42, 0, 0.58, 1],
      spring: [0.68, -0.55, 0.265, 1.55],
    },
  },
  
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },
  
  ai: {
    // AI-specific theming
    assistantColors: {
      personalAssistant: '#8B5CF6',
      teamAssistant: '#14B8A6',
      codeAssistant: '#F97316',
    },
    
    moodColors: {
      happy: '#10B981',
      neutral: '#6B7280',
      stressed: '#F59E0B',
      frustrated: '#EF4444',
    },
    
    productivityColors: {
      high: '#10B981',
      medium: '#F59E0B',
      low: '#EF4444',
    },
  },
  
  web3: {
    // Web3-specific theming
    walletColors: {
      ethereum: '#627EEA',
      polygon: '#8247E5',
      bitcoin: '#F7931A',
      custom: '#8B5CF6',
    },
    
    nftRarity: {
      common: '#6B7280',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
      mythic: '#EC4899',
    },
  },
  
  // Special Effects
  effects: {
    blur: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
    },
    
    opacity: {
      0: 0,
      5: 0.05,
      10: 0.1,
      20: 0.2,
      30: 0.3,
      40: 0.4,
      50: 0.5,
      60: 0.6,
      70: 0.7,
      80: 0.8,
      90: 0.9,
      95: 0.95,
      100: 1,
    },
  },
};

// Dark mode helper
export const getThemeColors = (isDarkMode: boolean) => {
  return isDarkMode ? MetrTheme.colors.dark : MetrTheme.colors.light;
};

// Gradient helper
export const createGradient = (type: keyof typeof MetrTheme.colors.gradients) => {
  return MetrTheme.colors.gradients[type];
};

// Responsive sizing helper
export const getResponsiveSize = (size: number, screenWidth: number): number => {
  if (screenWidth < MetrTheme.breakpoints.tablet) {
    return size * 0.9;
  } else if (screenWidth < MetrTheme.breakpoints.desktop) {
    return size * 0.95;
  }
  return size;
};

export default MetrTheme;
