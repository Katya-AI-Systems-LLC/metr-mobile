// METRCard.tsx - Custom METR Branded Card Component with Glassmorphism
import React from 'react';
import {View, StyleSheet, ViewStyle, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

interface METRCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
}

export const METRCard: React.FC<METRCardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 16,
  borderRadius = 16,
}) => {
  const renderCard = () => {
    const cardStyle = [
      styles.card,
      {
        padding,
        borderRadius,
        backgroundColor: variant === 'glass' ? 'transparent' : MetrTheme.colors.dark.surface,
      },
      style,
    ];

    if (variant === 'glass') {
      return (
        <View style={[cardStyle, styles.glassCard]}>
          <LinearGradient
            colors={MetrTheme.colors.gradients.glass}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[StyleSheet.absoluteFill, {borderRadius}]}
          />
          <View style={styles.glassContent}>{children}</View>
        </View>
      );
    }

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={[MetrTheme.colors.dark.surface, MetrTheme.colors.dark.surfaceLight]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={cardStyle}
        >
          {children}
        </LinearGradient>
      );
    }

    if (variant === 'elevated') {
      return (
        <View style={[cardStyle, styles.elevatedCard]}>
          {children}
        </View>
      );
    }

    return <View style={cardStyle}>{children}</View>;
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {renderCard()}
      </TouchableOpacity>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  glassCard: {
    borderWidth: 1,
    borderColor: MetrTheme.colors.glass.purpleBlur,
  },
  glassContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  elevatedCard: {
    shadowColor: MetrTheme.colors.primary.electric,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default METRCard;

