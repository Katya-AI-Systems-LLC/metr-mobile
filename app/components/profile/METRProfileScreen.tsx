// METRProfileScreen.tsx - Custom METR Branded Profile Screen
import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRAvatar} from './METRAvatar';
import {METRCard} from '../ui/METRCard';
import {METRButton} from '../ui/METRButton';
import {METRTabs} from '../ui/METRTabs';

interface METRProfileScreenProps {
  user: {
    name: string;
    email: string;
    role?: string;
    avatar?: any;
    bio?: string;
  };
  stats?: Array<{label: string; value: string}>;
  onEdit?: () => void;
  onSettings?: () => void;
}

export const METRProfileScreen: React.FC<METRProfileScreenProps> = ({
  user,
  stats,
  onEdit,
  onSettings,
}) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    {id: 'overview', label: 'Overview'},
    {id: 'activity', label: 'Activity'},
    {id: 'achievements', label: 'Achievements'},
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[MetrTheme.colors.dark.background, MetrTheme.colors.dark.surface]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <METRAvatar
            size={80}
            name={user.name}
            image={user.avatar}
            variant="gradient"
            status="online"
          />
          <Text style={styles.name}>{user.name}</Text>
          {user.role && <Text style={styles.role}>{user.role}</Text>}
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          <View style={styles.actions}>
            {onEdit && (
              <METRButton
                title="Edit Profile"
                onPress={onEdit}
                variant="outline"
                size="medium"
              />
            )}
            {onSettings && (
              <TouchableOpacity onPress={onSettings} style={styles.settingsButton}>
                <Text style={styles.settingsText}>⚙️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {stats && stats.length > 0 && (
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <METRCard key={index} variant="glass" style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </METRCard>
          ))}
        </View>
      )}

      <View style={styles.tabsContainer}>
        <METRTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && (
          <METRCard variant="glass">
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{user.bio || 'No bio available'}</Text>
          </METRCard>
        )}
        {activeTab === 'activity' && (
          <METRCard variant="glass">
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionText}>Activity feed coming soon...</Text>
          </METRCard>
        )}
        {activeTab === 'achievements' && (
          <METRCard variant="glass">
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.sectionText}>Achievements coming soon...</Text>
          </METRCard>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginTop: 16,
  },
  role: {
    fontSize: 16,
    color: MetrTheme.colors.primary.electric,
    marginTop: 4,
    fontWeight: '500',
  },
  bio: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MetrTheme.colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: -16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MetrTheme.colors.primary.electric,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  tabsContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
    lineHeight: 24,
  },
});

export default METRProfileScreen;

