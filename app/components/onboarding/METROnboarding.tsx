// METROnboarding.tsx - Custom METR Branded Onboarding Flow
import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';
import {METRButton} from '../ui/METRButton';
import {METRCard} from '../ui/METRCard';

interface OnboardingSlide {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface METROnboardingProps {
  slides: OnboardingSlide[];
  onComplete: () => void;
  onSkip?: () => void;
}

const {width} = Dimensions.get('window');

export const METROnboarding: React.FC<METROnboardingProps> = ({
  slides,
  onComplete,
  onSkip,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[MetrTheme.colors.dark.background, MetrTheme.colors.dark.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <METRLogo size={48} variant="icon" color="primary" />
          {onSkip && (
            <METRButton
              title="Skip"
              onPress={handleSkip}
              variant="ghost"
              size="small"
            />
          )}
        </View>

        {/* Slides */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          ref={ref => {
            if (ref) {
              ref.scrollTo({x: currentIndex * width, animated: true});
            }
          }}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <METRCard variant="glass" padding={32} style={styles.card}>
                {slide.icon && <View style={styles.iconContainer}>{slide.icon}</View>}
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </METRCard>
            </View>
          ))}
        </ScrollView>

        {/* Indicators */}
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentIndex > 0 && (
            <METRButton
              title="Previous"
              onPress={handlePrevious}
              variant="outline"
              size="medium"
            />
          )}
          <METRButton
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
            size="medium"
            fullWidth={currentIndex === 0}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MetrTheme.colors.dark.border,
  },
  indicatorActive: {
    backgroundColor: MetrTheme.colors.primary.electric,
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
});

export default METROnboarding;

