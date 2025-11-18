// METRNotification.tsx - Custom METR Branded Notification Component
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface METRNotificationProps {
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  onClose?: () => void;
  showLogo?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const METRNotification: React.FC<METRNotificationProps> = ({
  title,
  message,
  type = 'info',
  duration = 3000,
  onClose,
  showLogo = true,
  action,
}) => {
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, {damping: 15, stiffness: 300});
    opacity.value = withTiming(1, {duration: 300});

    if (duration > 0) {
      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const hide = () => {
    translateY.value = withTiming(-200, {duration: 300});
    opacity.value = withTiming(0, {duration: 300}, () => {
      if (onClose) {
        runOnJS(onClose)();
      }
    });
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return [MetrTheme.colors.semantic.success, MetrTheme.colors.primary.teal];
      case 'error':
        return [MetrTheme.colors.semantic.error, MetrTheme.colors.primary.pink];
      case 'warning':
        return [MetrTheme.colors.semantic.warning, '#F97316'];
      default:
        return [MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink];
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={getColors()}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {showLogo && (
            <View style={styles.logoContainer}>
              <METRLogo size={24} variant="icon" color="white" />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
          {action && (
            <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={hide} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10000,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    marginRight: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default METRNotification;

