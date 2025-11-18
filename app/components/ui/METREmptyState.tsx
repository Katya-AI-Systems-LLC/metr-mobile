// METREmptyState.tsx - Custom METR Branded Empty State Component
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface METREmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  showLogo?: boolean;
  action?: React.ReactNode;
}

export const METREmptyState: React.FC<METREmptyStateProps> = ({
  title,
  message,
  icon,
  showLogo = true,
  action,
}) => {
  return (
    <View style={styles.container}>
      {showLogo && !icon && (
        <View style={styles.logoContainer}>
          <METRLogo size={64} variant="icon" color="primary" />
        </View>
      )}
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 16,
  },
});

export default METREmptyState;

