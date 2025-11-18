// GlassCard.tsx - Modern glassmorphism card component for METR
import React, {ReactNode} from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  blurAmount?: number;
  borderRadius?: number;
  borderWidth?: number;
  glassTint?: 'light' | 'dark' | 'purple' | 'teal';
  animated?: boolean;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blurAmount = 10,
  borderRadius = 20,
  borderWidth = 1,
  glassTint = 'dark',
  animated = false,
  onPress,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const getGlassColors = () => {
    switch (glassTint) {
      case 'light':
        return {
          background: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
          border: 'rgba(255, 255, 255, 0.2)',
        };
      case 'purple':
        return {
          background: ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)'],
          border: 'rgba(139, 92, 246, 0.3)',
        };
      case 'teal':
        return {
          background: ['rgba(20, 184, 166, 0.1)', 'rgba(20, 184, 166, 0.05)'],
          border: 'rgba(20, 184, 166, 0.3)',
        };
      case 'dark':
      default:
        return {
          background: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)'],
          border: 'rgba(255, 255, 255, 0.1)',
        };
    }
  };

  const colors = getGlassColors();

  const CardContent = () => (
    <LinearGradient
      colors={colors.background}
      style={[
        styles.container,
        {
          borderRadius,
          borderWidth,
          borderColor: colors.border,
        },
        style,
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          blurType={glassTint === 'light' ? 'light' : 'dark'}
          blurAmount={blurAmount}
          style={[styles.blurView, {borderRadius}]}
        >
          <View style={styles.content}>{children}</View>
        </BlurView>
      ) : (
        <View style={[styles.androidBlur, {borderRadius}]}>
          <View style={styles.content}>{children}</View>
        </View>
      )}
    </LinearGradient>
  );

  if (animated) {
    const animatedStyle = {
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.02],
          }),
        },
      ],
      opacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1],
      }),
    };

    return (
      <Animated.View style={animatedStyle}>
        <CardContent />
      </Animated.View>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    padding: 16,
    zIndex: 1,
  },
});
