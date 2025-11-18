// METRLogo.tsx - METR Brand Logo Component
// Minimalist geometric design with "M" as mountain peak symbol
import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import {MetrTheme} from '../../theme/metrTheme';

interface METRLogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'text';
  animated?: boolean;
  style?: ViewStyle;
  color?: 'primary' | 'secondary' | 'accent' | 'white';
}

export const METRLogo: React.FC<METRLogoProps> = ({
  size = 48,
  variant = 'full',
  animated = false,
  style,
  color = 'primary',
}) => {
  const gradientId = `metr-gradient-${color}`;
  
  // Get gradient colors based on color prop
  const getGradientColors = () => {
    switch (color) {
      case 'primary':
        return [
          {offset: '0%', color: MetrTheme.colors.primary.electric},
          {offset: '100%', color: MetrTheme.colors.primary.pink},
        ];
      case 'secondary':
        return [
          {offset: '0%', color: MetrTheme.colors.primary.teal},
          {offset: '100%', color: MetrTheme.colors.primary.electric},
        ];
      case 'accent':
        return [
          {offset: '0%', color: MetrTheme.colors.primary.pink},
          {offset: '100%', color: MetrTheme.colors.primary.electric},
        ];
      case 'white':
        return [
          {offset: '0%', color: '#FFFFFF'},
          {offset: '100%', color: '#E5E7EB'},
        ];
      default:
        return [
          {offset: '0%', color: MetrTheme.colors.primary.electric},
          {offset: '100%', color: MetrTheme.colors.primary.pink},
        ];
    }
  };

  // Mountain "M" path - represents achievement and reaching goals
  const mountainMPath = `
    M ${size * 0.2} ${size * 0.8}
    L ${size * 0.35} ${size * 0.3}
    L ${size * 0.5} ${size * 0.6}
    L ${size * 0.65} ${size * 0.2}
    L ${size * 0.8} ${size * 0.8}
    Z
  `;

  // Simplified icon version (just the mountain peak)
  const iconPath = `
    M ${size * 0.1} ${size * 0.9}
    L ${size * 0.3} ${size * 0.3}
    L ${size * 0.5} ${size * 0.7}
    L ${size * 0.7} ${size * 0.2}
    L ${size * 0.9} ${size * 0.9}
    Z
  `;

  const renderIcon = () => (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {getGradientColors().map((stop, index) => (
            <Stop key={index} offset={stop.offset} stopColor={stop.color} />
          ))}
        </LinearGradient>
      </Defs>
      <Path
        d={iconPath}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
    </Svg>
  );

  const renderFull = () => (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {getGradientColors().map((stop, index) => (
              <Stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </LinearGradient>
        </Defs>
        <Path
          d={mountainMPath}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
      </Svg>
    </View>
  );

  const renderText = () => (
    <View style={[styles.textContainer, style]}>
      {renderIcon()}
      <View style={styles.textWrapper}>
        <View style={styles.textGradient}>
          <Svg width={size * 2} height={size * 0.4} viewBox="0 0 100 20">
            <Defs>
              <LinearGradient id={`text-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                {getGradientColors().map((stop, index) => (
                  <Stop key={index} offset={stop.offset} stopColor={stop.color} />
                ))}
              </LinearGradient>
            </Defs>
            <Path
              d="M 5 15 L 15 5 L 25 12 L 35 3 L 45 15 Z"
              fill={`url(#text-${gradientId})`}
            />
          </Svg>
        </View>
      </View>
    </View>
  );

  switch (variant) {
    case 'icon':
      return renderIcon();
    case 'text':
      return renderText();
    case 'full':
    default:
      return renderFull();
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textWrapper: {
    justifyContent: 'center',
  },
  textGradient: {
    height: 20,
  },
});

export default METRLogo;

