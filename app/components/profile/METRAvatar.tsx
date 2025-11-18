// METRAvatar.tsx - Custom METR Branded Avatar Component with Gradients
import React from 'react';
import {View, Text, StyleSheet, Image, ImageSourcePropType} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface METRAvatarProps {
  size?: number;
  name?: string;
  image?: ImageSourcePropType;
  variant?: 'default' | 'gradient' | 'logo';
  status?: 'online' | 'offline' | 'away' | 'busy';
  badge?: number;
}

export const METRAvatar: React.FC<METRAvatarProps> = ({
  size = 48,
  name,
  image,
  variant = 'default',
  status,
  badge,
}) => {
  const getInitials = (): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'online':
        return MetrTheme.colors.semantic.success;
      case 'away':
        return MetrTheme.colors.semantic.warning;
      case 'busy':
        return MetrTheme.colors.semantic.error;
      default:
        return MetrTheme.colors.dark.border;
    }
  };

  const renderContent = () => {
    if (image) {
      return <Image source={image} style={[styles.image, {width: size, height: size}]} />;
    }

    if (variant === 'logo') {
      return <METRLogo size={size * 0.6} variant="icon" color="white" />;
    }

    return (
      <Text style={[styles.initials, {fontSize: size * 0.4}]}>
        {getInitials()}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {variant === 'gradient' || variant === 'logo' ? (
          <LinearGradient
            colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              styles.gradient,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.defaultBackground,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: MetrTheme.colors.dark.surface,
              },
            ]}
          >
            {renderContent()}
          </View>
        )}
      </View>
      {status && (
        <View
          style={[
            styles.status,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
              backgroundColor: getStatusColor(),
              borderColor: MetrTheme.colors.dark.background,
              borderWidth: 2,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
      {badge && badge > 0 && (
        <View
          style={[
            styles.badge,
            {
              minWidth: size * 0.5,
              height: size * 0.5,
              borderRadius: (size * 0.5) / 2,
              top: -size * 0.1,
              right: -size * 0.1,
            },
          ]}
        >
          <Text style={[styles.badgeText, {fontSize: size * 0.25}]}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBackground: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderRadius: 50,
  },
  initials: {
    color: MetrTheme.colors.dark.text,
    fontWeight: '600',
  },
  status: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    backgroundColor: MetrTheme.colors.primary.pink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default METRAvatar;

