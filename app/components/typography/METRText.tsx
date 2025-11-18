// METRText.tsx - Custom METR Branded Text Components with Gradients and Animations
import React from 'react';
import {Text, StyleSheet, TextStyle, TextProps} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {MetrTheme} from '../../theme/metrTheme';

interface METRTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  gradient?: boolean;
  animated?: boolean;
  color?: string;
  children: React.ReactNode;
}

export const METRText: React.FC<METRTextProps> = ({
  variant = 'body',
  gradient = false,
  animated = false,
  color,
  children,
  style,
  ...props
}) => {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      shimmer.value = withRepeat(
        withTiming(1, {duration: 2000}),
        -1,
        false
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    return {
      opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.5, 1, 0.5]),
    };
  });

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: 32,
          fontWeight: 'bold',
          lineHeight: 40,
          letterSpacing: -0.5,
        };
      case 'h2':
        return {
          fontSize: 24,
          fontWeight: 'bold',
          lineHeight: 32,
          letterSpacing: -0.3,
        };
      case 'h3':
        return {
          fontSize: 20,
          fontWeight: '600',
          lineHeight: 28,
        };
      case 'button':
        return {
          fontSize: 16,
          fontWeight: '600',
          lineHeight: 24,
        };
      case 'caption':
        return {
          fontSize: 12,
          fontWeight: '400',
          lineHeight: 16,
        };
      default:
        return {
          fontSize: 16,
          fontWeight: '400',
          lineHeight: 24,
        };
    }
  };

  const textColor = color || MetrTheme.colors.dark.text;

  if (gradient) {
    return (
      <MaskedView
        maskElement={
          <Animated.Text
            style={[
              styles.base,
              getVariantStyle(),
              style,
              animatedStyle,
            ]}
            {...props}
          >
            {children}
          </Animated.Text>
        }
      >
        <LinearGradient
          colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Animated.Text
            style={[
              styles.base,
              getVariantStyle(),
              {opacity: 0},
              style,
              animatedStyle,
            ]}
            {...props}
          >
            {children}
          </Animated.Text>
        </LinearGradient>
      </MaskedView>
    );
  }

  return (
    <Animated.Text
      style={[
        styles.base,
        getVariantStyle(),
        {color: textColor},
        style,
        animatedStyle,
      ]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});

export default METRText;

