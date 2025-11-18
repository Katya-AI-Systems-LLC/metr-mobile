// METRSlider.tsx - Custom METR Branded Slider Component
import React, {useState} from 'react';
import {View, Text, StyleSheet, PanResponder, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

interface METRSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  showValue?: boolean;
  label?: string;
  disabled?: boolean;
  trackColor?: string;
  thumbColor?: string;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const THUMB_SIZE = 24;
const TRACK_HEIGHT = 6;

export const METRSlider: React.FC<METRSliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  showValue = true,
  label,
  disabled = false,
  trackColor,
  thumbColor,
}) => {
  const [sliderWidth, setSliderWidth] = useState(SLIDER_WIDTH);
  const translateX = useSharedValue(
    ((value - minimumValue) / (maximumValue - minimumValue)) * sliderWidth
  );

  React.useEffect(() => {
    translateX.value = withSpring(
      ((value - minimumValue) / (maximumValue - minimumValue)) * sliderWidth,
      {damping: 15, stiffness: 300}
    );
  }, [value, sliderWidth]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => {
      // Haptic feedback could be added here
    },
    onPanResponderMove: (_, gestureState) => {
      const newX = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 24));
      translateX.value = newX;
      const newValue =
        Math.round(
          ((newX / sliderWidth) * (maximumValue - minimumValue) + minimumValue) / step
        ) * step;
      onValueChange(Math.max(minimumValue, Math.min(maximumValue, newValue)));
    },
    onPanResponderRelease: () => {
      const finalValue =
        Math.round(
          ((translateX.value / sliderWidth) * (maximumValue - minimumValue) +
            minimumValue) /
            step
        ) * step;
      onValueChange(Math.max(minimumValue, Math.min(maximumValue, finalValue)));
    },
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value - THUMB_SIZE / 2}],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  const currentValue = Math.round(
    ((translateX.value / sliderWidth) * (maximumValue - minimumValue) + minimumValue) /
      step
  ) * step;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showValue && (
            <Text style={styles.value}>
              {Math.max(minimumValue, Math.min(maximumValue, currentValue))}
            </Text>
          )}
        </View>
      )}
      <View
        style={styles.sliderContainer}
        onLayout={event => {
          const {width} = event.nativeEvent.layout;
          if (width > 0) {
            setSliderWidth(width);
          }
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.track,
            {
              backgroundColor: trackColor || MetrTheme.colors.dark.surfaceLight,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        />
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient
            colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <LinearGradient
            colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              styles.thumbGradient,
              {
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.primary.electric,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: THUMB_SIZE / 2,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fill: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    top: (40 - THUMB_SIZE) / 2,
    left: 0,
  },
  thumbGradient: {
    shadowColor: MetrTheme.colors.primary.electric,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default METRSlider;

