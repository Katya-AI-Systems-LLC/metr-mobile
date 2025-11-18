// METRCheckbox.tsx - Custom METR Branded Checkbox Component
import React from 'react';
import {TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

interface METRCheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'gradient';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const METRCheckbox: React.FC<METRCheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  size = 'medium',
  variant = 'default',
}) => {
  const scale = useSharedValue(checked ? 1 : 0);
  const opacity = useSharedValue(checked ? 1 : 0);

  React.useEffect(() => {
    if (checked) {
      scale.value = withSpring(1, {damping: 15, stiffness: 300});
      opacity.value = withTiming(1, {duration: 200});
    } else {
      scale.value = withSpring(0, {damping: 15, stiffness: 300});
      opacity.value = withTiming(0, {duration: 200});
    }
  }, [checked]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const checkboxSize = getSize();
  const checkmarkSize = checkboxSize * 0.6;

  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{scale: checked ? 1.05 : 1}],
  }));

  return (
    <TouchableOpacity
      onPress={() => !disabled && onToggle(!checked)}
      disabled={disabled}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View style={[styles.checkboxContainer, animatedContainerStyle]}>
        <View
          style={[
            styles.checkbox,
            {
              width: checkboxSize,
              height: checkboxSize,
              borderRadius: checkboxSize * 0.2,
              borderColor: checked
                ? MetrTheme.colors.primary.electric
                : MetrTheme.colors.dark.border,
              borderWidth: 2,
              backgroundColor: checked
                ? 'transparent'
                : MetrTheme.colors.dark.surface,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {checked && (
            <AnimatedLinearGradient
              colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                styles.checkboxGradient,
                {
                  width: checkboxSize,
                  height: checkboxSize,
                  borderRadius: checkboxSize * 0.2,
                },
                animatedCheckboxStyle,
              ]}
            >
              <View style={styles.checkmarkContainer}>
                <Text style={[styles.checkmark, {fontSize: checkmarkSize}]}>✓</Text>
              </View>
            </AnimatedLinearGradient>
          )}
        </View>
      </Animated.View>
      {label && (
        <Text
          style={[
            styles.label,
            {
              fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  label: {
    color: MetrTheme.colors.dark.text,
    flex: 1,
  },
});

export default METRCheckbox;

