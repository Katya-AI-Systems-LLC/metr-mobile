// METRTooltip.tsx - Custom METR Branded Tooltip Component
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

interface METRTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showArrow?: boolean;
  delay?: number;
  maxWidth?: number;
}

export const METRTooltip: React.FC<METRTooltipProps> = ({
  content,
  children,
  position = 'top',
  showArrow = true,
  delay = 0,
  maxWidth = 200,
}) => {
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState({x: 0, y: 0, width: 0, height: 0});
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    setLayout({x, y, width, height});
  };

  const showTooltip = () => {
    setTimeout(() => {
      setVisible(true);
      opacity.value = withTiming(1, {duration: 200});
      scale.value = withSpring(1, {damping: 15, stiffness: 300});
    }, delay);
  };

  const hideTooltip = () => {
    opacity.value = withTiming(0, {duration: 150});
    scale.value = withTiming(0.8, {duration: 150});
    setTimeout(() => setVisible(false), 150);
  };

  const getTooltipStyle = () => {
    const tooltipHeight = 40;
    const tooltipWidth = Math.min(maxWidth, content.length * 8);
    const arrowSize = 8;

    switch (position) {
      case 'top':
        return {
          bottom: layout.height + arrowSize + 8,
          left: (layout.width - tooltipWidth) / 2,
        };
      case 'bottom':
        return {
          top: layout.height + arrowSize + 8,
          left: (layout.width - tooltipWidth) / 2,
        };
      case 'left':
        return {
          right: layout.width + arrowSize + 8,
          top: (layout.height - tooltipHeight) / 2,
        };
      case 'right':
        return {
          left: layout.width + arrowSize + 8,
          top: (layout.height - tooltipHeight) / 2,
        };
      default:
        return {};
    }
  };

  const getArrowStyle = () => {
    const arrowSize = 8;
    switch (position) {
      case 'top':
        return {
          top: -arrowSize,
          left: '50%',
          borderTopColor: MetrTheme.colors.dark.surface,
        };
      case 'bottom':
        return {
          bottom: -arrowSize,
          left: '50%',
          borderBottomColor: MetrTheme.colors.dark.surface,
        };
      case 'left':
        return {
          left: -arrowSize,
          top: '50%',
          borderLeftColor: MetrTheme.colors.dark.surface,
        };
      case 'right':
        return {
          right: -arrowSize,
          top: '50%',
          borderRightColor: MetrTheme.colors.dark.surface,
        };
      default:
        return {};
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPressIn={showTooltip}
        onPressOut={hideTooltip}
        onLayout={handleLayout}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
      {visible && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              maxWidth,
              ...getTooltipStyle(),
            },
            animatedStyle,
          ]}
        >
          <LinearGradient
            colors={[MetrTheme.colors.dark.surface, MetrTheme.colors.dark.surfaceLight]}
            style={styles.tooltipGradient}
          >
            <Text style={styles.tooltipText}>{content}</Text>
            {showArrow && (
              <View
                style={[
                  styles.arrow,
                  {
                    ...getArrowStyle(),
                  },
                ]}
              />
            )}
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    zIndex: 1000,
  },
  tooltipGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderWidth: 8,
    borderColor: 'transparent',
  },
});

export default METRTooltip;

