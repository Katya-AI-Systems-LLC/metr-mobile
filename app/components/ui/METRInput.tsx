// METRInput.tsx - Custom METR Branded Input Component
import React, {useState} from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface METRInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showLogo?: boolean;
  containerStyle?: ViewStyle;
}

export const METRInput: React.FC<METRInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  showLogo = false,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {showLogo && (
          <View style={styles.logoContainer}>
            <METRLogo size={20} variant="icon" color="primary" />
          </View>
        )}
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={MetrTheme.colors.dark.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity style={styles.iconContainer}>{rightIcon}</TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MetrTheme.colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MetrTheme.colors.dark.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: MetrTheme.colors.primary.electric,
    shadowColor: MetrTheme.colors.primary.electric,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerError: {
    borderColor: MetrTheme.colors.semantic.error,
  },
  logoContainer: {
    marginRight: 8,
  },
  iconContainer: {
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
    fontFamily: 'System',
  },
  errorText: {
    fontSize: 12,
    color: MetrTheme.colors.semantic.error,
    marginTop: 4,
  },
});

export default METRInput;

