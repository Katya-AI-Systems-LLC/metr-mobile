// METRTabs.tsx - Custom METR Branded Tabs Component
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface METRTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  scrollable?: boolean;
}

export const METRTabs: React.FC<METRTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  scrollable = false,
}) => {
  const [tabLayouts, setTabLayouts] = useState<{[key: string]: {x: number; width: number}}>({});
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  React.useEffect(() => {
    const activeLayout = tabLayouts[activeTab];
    if (activeLayout) {
      indicatorPosition.value = withSpring(activeLayout.x, {
        damping: 15,
        stiffness: 300,
      });
      indicatorWidth.value = withSpring(activeLayout.width, {
        damping: 15,
        stiffness: 300,
      });
    }
  }, [activeTab, tabLayouts]);

  const handleTabLayout = (tabId: string, event: any) => {
    const {x, width} = event.nativeEvent.layout;
    setTabLayouts(prev => ({...prev, [tabId]: {x, width}}));
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: indicatorPosition.value}],
    width: indicatorWidth.value,
  }));

  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.id;

    if (variant === 'pills') {
      return (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          onLayout={event => handleTabLayout(tab.id, event)}
          style={[
            styles.pillTab,
            isActive && styles.pillTabActive,
          ]}
        >
          {tab.icon && <View style={styles.tabIcon}>{tab.icon}</View>}
          <Text
            style={[
              styles.pillTabText,
              isActive && styles.pillTabTextActive,
            ]}
          >
            {tab.label}
          </Text>
          {tab.badge && tab.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.id}
        onPress={() => onTabChange(tab.id)}
        onLayout={event => handleTabLayout(tab.id, event)}
        style={styles.tab}
      >
        {tab.icon && <View style={styles.tabIcon}>{tab.icon}</View>}
        <Text
          style={[
            styles.tabText,
            isActive && styles.tabTextActive,
          ]}
        >
          {tab.label}
        </Text>
        {tab.badge && tab.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const TabsContainer = scrollable ? ScrollView : View;
  const tabsContainerProps = scrollable
    ? {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: styles.scrollableContent,
      }
    : {style: styles.tabsContainer};

  return (
    <View style={styles.container}>
      <TabsContainer {...tabsContainerProps}>
        {tabs.map(renderTab)}
      </TabsContainer>
      {variant === 'underline' && (
        <View style={styles.indicatorContainer}>
          <Animated.View style={[styles.indicator, indicatorStyle]}>
            <LinearGradient
              colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.pink]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: MetrTheme.colors.dark.border,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  scrollableContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    position: 'relative',
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: MetrTheme.colors.primary.electric,
    fontWeight: '600',
  },
  pillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: MetrTheme.colors.dark.surface,
    gap: 8,
  },
  pillTabActive: {
    backgroundColor: MetrTheme.colors.glass.purpleBlur,
  },
  pillTabText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    fontWeight: '500',
  },
  pillTabTextActive: {
    color: MetrTheme.colors.primary.electric,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: MetrTheme.colors.primary.pink,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  indicatorContainer: {
    height: 3,
    backgroundColor: MetrTheme.colors.dark.border,
  },
  indicator: {
    height: 3,
    borderRadius: 1.5,
  },
});

export default METRTabs;

