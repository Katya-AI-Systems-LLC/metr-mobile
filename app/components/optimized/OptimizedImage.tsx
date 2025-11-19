// OptimizedImage.tsx - Optimized Image Component
import React from 'react';
import {Image, ImageProps, StyleSheet, View, ActivityIndicator, Text} from 'react-native';
import {useOptimizedImage} from '../../hooks/useOptimizedImage';
import {MetrTheme} from '../../theme/metrTheme';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: string;
  showLoading?: boolean;
  showError?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  width,
  height,
  placeholder,
  fallback,
  showLoading = true,
  showError = true,
  style,
  ...props
}) => {
  const {url, loading, error, placeholder: optimizedPlaceholder} = useOptimizedImage({
    url: uri,
    width,
    height,
    placeholder,
    fallback,
  });

  if (loading && showLoading) {
    return (
      <View style={[styles.container, {width, height}, style]}>
        <ActivityIndicator size="small" color={MetrTheme.colors.primary.electric} />
      </View>
    );
  }

  if (error && showError) {
    return (
      <View style={[styles.container, {width, height}, style]}>
        <Text style={styles.errorText}>Failed to load image</Text>
      </View>
    );
  }

  return (
    <Image
      source={{uri: error ? fallback || url : url}}
      style={[{width, height}, style]}
      defaultSource={placeholder ? {uri: optimizedPlaceholder} : undefined}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MetrTheme.colors.dark.surface,
  },
  errorText: {
    color: MetrTheme.colors.dark.textSecondary,
    fontSize: 12,
  },
});

export default OptimizedImage;


