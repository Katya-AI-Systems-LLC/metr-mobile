// METRErrorScreen.tsx - Custom METR Branded Error Screen
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';
import {METRButton} from './METRButton';

interface METRErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  showLogo?: boolean;
}

export const METRErrorScreen: React.FC<METRErrorScreenProps> = ({
  title = 'Oops! Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry,
  retryText = 'Try Again',
  showLogo = true,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[MetrTheme.colors.dark.background, MetrTheme.colors.dark.surface]}
        style={styles.gradient}
      >
        {showLogo && (
          <View style={styles.logoContainer}>
            <METRLogo size={64} variant="icon" color="primary" />
          </View>
        )}
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          {onRetry && (
            <View style={styles.buttonContainer}>
              <METRButton
                title={retryText}
                onPress={onRetry}
                variant="primary"
                size="large"
              />
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
  },
});

export default METRErrorScreen;

