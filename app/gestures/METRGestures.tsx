// METRGestures.tsx - Custom METR Branded Gesture Handlers
import React, {useRef} from 'react';
import {View, StyleSheet, PanResponder, GestureResponderEvent} from 'react-native';
import {MetrTheme} from '../theme/metrTheme';
import {METRVibrations} from '../utils/vibrations/METRVibrations';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export const useMETRSwipe = (config: SwipeConfig) => {
  const {onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50, velocityThreshold = 0.3} = config;
  const startX = useRef(0);
  const startY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        startX.current = evt.nativeEvent.pageX;
        startY.current = evt.nativeEvent.pageY;
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: any) => {
        const {dx, dy, vx, vy} = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const absVx = Math.abs(vx);
        const absVy = Math.abs(vy);

        // Check if swipe meets threshold
        if (absDx > threshold || absDy > threshold) {
          METRVibrations.swipe();

          // Determine swipe direction
          if (absDx > absDy) {
            // Horizontal swipe
            if (dx > 0 && absVx > velocityThreshold) {
              onSwipeRight?.();
            } else if (dx < 0 && absVx > velocityThreshold) {
              onSwipeLeft?.();
            }
          } else {
            // Vertical swipe
            if (dy > 0 && absVy > velocityThreshold) {
              onSwipeDown?.();
            } else if (dy < 0 && absVy > velocityThreshold) {
              onSwipeUp?.();
            }
          }
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
};

interface LongPressConfig {
  onLongPress: () => void;
  delay?: number;
}

export const useMETRLongPress = (config: LongPressConfig) => {
  const {onLongPress, delay = 500} = config;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlers = {
    onStartShouldSetResponder: () => true,
    onResponderGrant: () => {
      timerRef.current = setTimeout(() => {
        METRVibrations.longPress();
        onLongPress();
      }, delay);
    },
    onResponderRelease: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    onResponderTerminate: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
  };

  return handlers;
};

interface METRGestureViewProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

export const METRGestureView: React.FC<METRGestureViewProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
}) => {
  const swipeHandlers = useMETRSwipe({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold: swipeThreshold,
  });

  const longPressHandlers = useMETRLongPress({
    onLongPress: onLongPress || (() => {}),
    delay: longPressDelay,
  });

  return (
    <View
      style={styles.container}
      {...swipeHandlers}
      {...(onLongPress ? longPressHandlers : {})}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default {useMETRSwipe, useMETRLongPress, METRGestureView};

