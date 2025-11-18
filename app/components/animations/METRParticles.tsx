// METRParticles.tsx - Custom METR Branded Particle Effects
import React, {useEffect} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface METRParticlesProps {
  count?: number;
  variant?: 'purple' | 'teal' | 'pink' | 'mixed';
  intensity?: 'low' | 'medium' | 'high';
}

const createParticles = (count: number): Particle[] => {
  return Array.from({length: count}, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3000 + 2000,
    delay: Math.random() * 1000,
  }));
};

const ParticleComponent: React.FC<{
  particle: Particle;
  variant: string;
}> = ({particle, variant}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(
        -SCREEN_HEIGHT - particle.y,
        {
          duration: particle.duration,
          easing: Easing.linear,
        }
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withTiming(1, {
        duration: particle.duration / 2,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const getColors = () => {
    switch (variant) {
      case 'purple':
        return [MetrTheme.colors.primary.electric, MetrTheme.colors.primary.electric + '80'];
      case 'teal':
        return [MetrTheme.colors.primary.teal, MetrTheme.colors.primary.teal + '80'];
      case 'pink':
        return [MetrTheme.colors.primary.pink, MetrTheme.colors.primary.pink + '80'];
      default:
        const colors = [
          MetrTheme.colors.primary.electric,
          MetrTheme.colors.primary.teal,
          MetrTheme.colors.primary.pink,
        ];
        return [colors[particle.id % 3], colors[particle.id % 3] + '80'];
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={getColors()}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

export const METRParticles: React.FC<METRParticlesProps> = ({
  count = 50,
  variant = 'mixed',
  intensity = 'medium',
}) => {
  const particleCount = intensity === 'low' ? count / 2 : intensity === 'high' ? count * 2 : count;
  const particles = createParticles(particleCount);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <ParticleComponent key={particle.id} particle={particle} variant={variant} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
});

export default METRParticles;

