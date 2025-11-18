// METRRadio.tsx - Custom METR Branded Radio Button Component
import React from 'react';
import {TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

interface METRRadioProps {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const METRRadio: React.FC<METRRadioProps> = ({
  selected,
  onSelect,
  label,
  disabled = false,
  size = 'medium',
}) => {
  const scale = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(selected ? 1 : 0, {damping: 15, stiffness: 300});
  }, [selected]);

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

  const radioSize = getSize();
  const dotSize = radioSize * 0.4;

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: scale.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{scale: selected ? 1.05 : 1}],
  }));

  return (
    <TouchableOpacity
      onPress={() => !disabled && onSelect()}
      disabled={disabled}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View style={[styles.radioContainer, animatedContainerStyle]}>
        <View
          style={[
            styles.radio,
            {
              width: radioSize,
              height: radioSize,
              borderRadius: radioSize / 2,
              borderColor: selected
                ? MetrTheme.colors.primary.electric
                : MetrTheme.colors.dark.border,
              borderWidth: 2,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {selected && (
            <AnimatedLinearGradient
              colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                styles.radioDot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                },
                animatedDotStyle,
              ]}
            />
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

interface METRRadioGroupProps {
  options: Array<{value: string; label: string}>;
  selectedValue: string;
  onSelect: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
}

export const METRRadioGroup: React.FC<METRRadioGroupProps> = ({
  options,
  selectedValue,
  onSelect,
  size = 'medium',
}) => {
  return (
    <View style={styles.group}>
      {options.map(option => (
        <METRRadio
          key={option.value}
          selected={selectedValue === option.value}
          onSelect={() => onSelect(option.value)}
          label={option.label}
          size={size}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MetrTheme.colors.dark.surface,
  },
  radioDot: {
    position: 'absolute',
  },
  label: {
    color: MetrTheme.colors.dark.text,
    flex: 1,
  },
  group: {
    gap: 16,
  },
});

export default {METRRadio, METRRadioGroup};

