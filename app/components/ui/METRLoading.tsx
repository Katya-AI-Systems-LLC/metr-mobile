// METRLoading.tsx - Custom METR Branded Loading Component
import React from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface METRLoadingProps {
  size?: 'small' | 'large';
  text?: string;
  showLogo?: boolean;
  variant?: 'default' | 'fullscreen' | 'inline';
}

export const METRLoading: React.FC<METRLoadingProps> = ({
  size = 'large',
  text,
  showLogo = true,
  variant = 'default',
}) => {
  if (variant === 'fullscreen') {
    return (
      <View style={styles.fullscreen}>
        <LinearGradient
          colors={[MetrTheme.colors.dark.background, MetrTheme.colors.dark.surface]}
          style={styles.fullscreenGradient}
        >
          {showLogo && (
            <View style={styles.logoContainer}>
              <METRLogo size={80} variant="icon" color="primary" />
            </View>
          )}
          <ActivityIndicator
            size={size}
            color={MetrTheme.colors.primary.electric}
            style={styles.spinner}
          />
          {text && <Text style={styles.text}>{text}</Text>}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainerInline}>
          <METRLogo size={32} variant="icon" color="primary" />
        </View>
      )}
      <ActivityIndicator size={size} color={MetrTheme.colors.primary.electric} />
      {text && <Text style={styles.textInline}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  fullscreenGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoContainerInline: {
    marginRight: 8,
  },
  spinner: {
    marginTop: 16,
  },
  text: {
    marginTop: 24,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
    fontWeight: '500',
  },
  textInline: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
});

export default METRLoading;

