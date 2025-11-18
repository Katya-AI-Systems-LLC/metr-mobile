// METRButton.tsx - Custom METR Branded Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface METRButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  showLogo?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const METRButton: React.FC<METRButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  showLogo = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getGradientColors = (): string[] => {
    switch (variant) {
      case 'primary':
        return [MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink];
      case 'secondary':
        return [MetrTheme.colors.primary.teal, MetrTheme.colors.primary.electric];
      case 'accent':
        return [MetrTheme.colors.primary.pink, MetrTheme.colors.primary.electric];
      default:
        return [MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {paddingVertical: 8, paddingHorizontal: 16, fontSize: 14};
      case 'large':
        return {paddingVertical: 16, paddingHorizontal: 32, fontSize: 18};
      default:
        return {paddingVertical: 12, paddingHorizontal: 24, fontSize: 16};
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? MetrTheme.colors.primary.electric : '#FFFFFF'}
          size="small"
        />
      );
    }

    return (
      <View style={styles.content}>
        {showLogo && <METRLogo size={16} variant="icon" color="white" />}
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, {fontSize: sizeStyles.fontSize}, textStyle]}>
          {title}
        </Text>
      </View>
    );
  };

  if (variant === 'outline' || variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          styles.outlineButton,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            borderColor: variant === 'outline' ? MetrTheme.colors.primary.electric : 'transparent',
            width: fullWidth ? '100%' : 'auto',
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
        ]}
      >
        {renderContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default METRButton;

