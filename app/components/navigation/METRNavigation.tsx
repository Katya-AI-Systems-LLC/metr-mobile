// METRNavigation.tsx - Custom METR Branded Navigation Components
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface METRBottomNavigationProps {
  items: NavigationItem[];
  activeId: string;
  onPress: (id: string) => void;
}

export const METRBottomNavigation: React.FC<METRBottomNavigationProps> = ({
  items,
  activeId,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[MetrTheme.colors.dark.surface, MetrTheme.colors.dark.background]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradient}
      >
        {items.map(item => {
          const isActive = item.id === activeId;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onPress(item.id)}
              style={[styles.item, isActive && styles.itemActive]}
              activeOpacity={0.7}
            >
              {item.icon && (
                <View style={styles.iconContainer}>
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

interface METRTopNavigationProps {
  title: string;
  showLogo?: boolean;
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode[];
}

export const METRTopNavigation: React.FC<METRTopNavigationProps> = ({
  title,
  showLogo = false,
  leftAction,
  rightActions,
}) => {
  return (
    <View style={styles.topContainer}>
      <LinearGradient
        colors={[MetrTheme.colors.dark.background, MetrTheme.colors.dark.surface]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.topGradient}
      >
        <View style={styles.topContent}>
          {leftAction && <View style={styles.leftAction}>{leftAction}</View>}
          
          <View style={styles.titleContainer}>
            {showLogo && <METRLogo size={24} variant="icon" color="primary" />}
            <Text style={styles.topTitle}>{title}</Text>
          </View>
          
          {rightActions && (
            <View style={styles.rightActions}>
              {rightActions.map((action, index) => (
                <View key={index} style={styles.rightAction}>
                  {action}
                </View>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: MetrTheme.colors.dark.border,
  },
  gradient: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  itemActive: {
    backgroundColor: MetrTheme.colors.glass.purpleBlur,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: MetrTheme.colors.primary.pink,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: MetrTheme.colors.primary.electric,
    fontWeight: '600',
  },
  topContainer: {
    borderBottomWidth: 1,
    borderBottomColor: MetrTheme.colors.dark.border,
  },
  topGradient: {
    paddingTop: 50,
    paddingBottom: 16,
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftAction: {
    width: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightAction: {
    width: 40,
    alignItems: 'flex-end',
  },
});

export default {METRBottomNavigation, METRTopNavigation};

