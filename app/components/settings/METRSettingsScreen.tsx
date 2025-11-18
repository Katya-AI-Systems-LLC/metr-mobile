// METRSettingsScreen.tsx - Custom METR Branded Settings Screen
import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRCard} from '../ui/METRCard';
import {METRCheckbox} from '../ui/METRCheckbox';
import {METRSlider} from '../ui/METRSlider';
import {METRTabs} from '../ui/METRTabs';

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'switch' | 'button' | 'slider' | 'checkbox';
  value?: boolean | number | string;
  onPress?: () => void;
  onValueChange?: (value: any) => void;
  icon?: React.ReactNode;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

interface METRSettingsScreenProps {
  sections: SettingsSection[];
  onBack?: () => void;
}

export const METRSettingsScreen: React.FC<METRSettingsScreenProps> = ({
  sections,
  onBack,
}) => {
  const [activeTab, setActiveTab] = React.useState('general');

  const tabs = [
    {id: 'general', label: 'General'},
    {id: 'notifications', label: 'Notifications'},
    {id: 'appearance', label: 'Appearance'},
    {id: 'advanced', label: 'Advanced'},
  ];

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'switch':
        return (
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              {item.icon && <View style={styles.settingIcon}>{item.icon}</View>}
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingDescription}>{item.description}</Text>
                )}
              </View>
            </View>
            <Switch
              value={item.value as boolean}
              onValueChange={item.onValueChange}
              trackColor={{
                false: MetrTheme.colors.dark.surfaceLight,
                true: MetrTheme.colors.primary.electric,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        );
      case 'slider':
        return (
          <View style={styles.settingItem}>
            <METRSlider
              value={item.value as number}
              onValueChange={item.onValueChange || (() => {})}
              label={item.label}
              showValue
            />
          </View>
        );
      case 'checkbox':
        return (
          <METRCheckbox
            checked={item.value as boolean}
            onToggle={item.onValueChange || (() => {})}
            label={item.label}
          />
        );
      default:
        return (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              {item.icon && <View style={styles.settingIcon}>{item.icon}</View>}
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingDescription}>{item.description}</Text>
                )}
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[MetrTheme.colors.dark.background, MetrTheme.colors.dark.surface]}
        style={styles.header}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      <METRTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underline"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <METRCard variant="glass" style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </METRCard>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: MetrTheme.colors.dark.text,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 12,
  },
  sectionCard: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    marginRight: 4,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: MetrTheme.colors.dark.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: MetrTheme.colors.dark.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: MetrTheme.colors.dark.border,
    marginVertical: 8,
  },
});

export default METRSettingsScreen;

