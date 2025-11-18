// METRTransitions.tsx - Custom METR Branded Screen Transitions
import React from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';
import {MetrTheme} from '../theme/metrTheme';

export class METRTransitions {
  // Fade transition
  static fadeTransition(duration: number = 300) {
    return {
      transitionSpec: {
        duration,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: ({position, scene}: any) => {
        const {index} = scene;
        const opacity = position.interpolate({
          inputRange: [index - 1, index],
          outputRange: [0, 1],
        });

        return {
          opacity,
        };
      },
    };
  }

  // Slide transition
  static slideTransition(direction: 'left' | 'right' | 'up' | 'down' = 'right', duration: number = 300) {
    return {
      transitionSpec: {
        duration,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: ({position, scene}: any) => {
        const {index} = scene;
        let translateX = 0;
        let translateY = 0;

        switch (direction) {
          case 'left':
            translateX = position.interpolate({
              inputRange: [index - 1, index],
              outputRange: [-300, 0],
            });
            break;
          case 'right':
            translateX = position.interpolate({
              inputRange: [index - 1, index],
              outputRange: [300, 0],
            });
            break;
          case 'up':
            translateY = position.interpolate({
              inputRange: [index - 1, index],
              outputRange: [-300, 0],
            });
            break;
          case 'down':
            translateY = position.interpolate({
              inputRange: [index - 1, index],
              outputRange: [300, 0],
            });
            break;
        }

        return {
          transform: [{translateX}, {translateY}],
        };
      },
    };
  }

  // Scale transition
  static scaleTransition(duration: number = 300) {
    return {
      transitionSpec: {
        duration,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: ({position, scene}: any) => {
        const {index} = scene;
        const scale = position.interpolate({
          inputRange: [index - 1, index],
          outputRange: [0.8, 1],
        });
        const opacity = position.interpolate({
          inputRange: [index - 1, index],
          outputRange: [0, 1],
        });

        return {
          opacity,
          transform: [{scale}],
        };
      },
    };
  }

  // METR gradient transition (custom)
  static metrTransition(duration: number = 400) {
    return {
      transitionSpec: {
        duration,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        timing: Animated.timing,
      },
      screenInterpolator: ({position, scene}: any) => {
        const {index} = scene;
        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.5, index],
          outputRange: [0, 0.5, 1],
        });
        const translateX = position.interpolate({
          inputRange: [index - 1, index],
          outputRange: [100, 0],
        });
        const scale = position.interpolate({
          inputRange: [index - 1, index],
          outputRange: [0.9, 1],
        });

        return {
          opacity,
          transform: [{translateX}, {scale}],
        };
      },
    };
  }
}

// Animation helpers
export const METRAnimations = {
  // Fade in
  fadeIn: (value: Animated.Value, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    });
  },

  // Fade out
  fadeOut: (value: Animated.Value, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.poly(4)),
      useNativeDriver: true,
    });
  },

  // Scale in
  scaleIn: (value: Animated.Value, duration: number = 300) => {
    return Animated.spring(value, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    });
  },

  // Scale out
  scaleOut: (value: Animated.Value, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.poly(4)),
      useNativeDriver: true,
    });
  },

  // Slide in from right
  slideInRight: (value: Animated.Value, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    });
  },

  // Pulse animation
  pulse: (value: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  },

  // Shake animation
  shake: (value: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  },
};

export default METRTransitions;

