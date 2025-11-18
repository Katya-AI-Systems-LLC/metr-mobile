// MetrHomeScreen.tsx - METR main home screen with modern design
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  RefreshControl,
  FlatList,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../../components/glassmorphism/GlassCard';
import {MetrTheme} from '../../theme/metrTheme';
import AIManager from '../../ai/core/AIManager';
import Web3Manager from '../../web3/Web3Manager';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  badge?: number;
  onPress: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  mood?: 'happy' | 'neutral' | 'stressed';
}

interface ProductivityMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export const MetrHomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [productivityScore, setProductivityScore] = useState(85);
  const [teamMood, setTeamMood] = useState<'happy' | 'neutral' | 'stressed'>('happy');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const aiManager = useRef(AIManager.getInstance());
  const web3Manager = useRef(Web3Manager.getInstance());

  useEffect(() => {
    initializeScreen();
    startAnimations();
  }, []);

  const initializeScreen = async () => {
    try {
      // Initialize managers
      await aiManager.current.initialize();
      await web3Manager.current.initialize();
      
      // Get AI insight
      const insight = await aiManager.current.askAssistant(
        "What's the team's focus for today?",
        {userId: 'current_user'}
      );
      setAiInsight(insight);
      
      // Check wallet connection
      const connected = web3Manager.current.isWalletConnected();
      setWalletConnected(connected);
      
      // Get productivity score
      const score = await aiManager.current.getProductivityScore('current_user');
      setProductivityScore(score.score);
    } catch (error) {
      console.error('Failed to initialize home screen:', error);
    }
  };

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 2,
      useNativeDriver: true,
    }).start();
    
    // Pulse animation for AI assistant
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      initializeScreen();
      setRefreshing(false);
    }, 2000);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'AI Chat',
      icon: 'robot',
      color: MetrTheme.colors.primary.electric,
      badge: 3,
      onPress: () => console.log('Open AI Chat'),
    },
    {
      id: '2',
      title: 'Tasks',
      icon: 'checkbox-marked-circle',
      color: MetrTheme.colors.primary.teal,
      badge: 5,
      onPress: () => console.log('Open Tasks'),
    },
    {
      id: '3',
      title: 'Meeting',
      icon: 'video',
      color: MetrTheme.colors.primary.pink,
      onPress: () => console.log('Start Meeting'),
    },
    {
      id: '4',
      title: 'Analytics',
      icon: 'chart-line',
      color: '#F97316',
      onPress: () => console.log('View Analytics'),
    },
  ];

  const teamMembers: TeamMember[] = [
    {id: '1', name: 'Alex Chen', avatar: '👨‍💻', status: 'online', mood: 'happy'},
    {id: '2', name: 'Sarah Kim', avatar: '👩‍💼', status: 'busy', mood: 'neutral'},
    {id: '3', name: 'Mike Johnson', avatar: '👨‍🎨', status: 'online', mood: 'happy'},
    {id: '4', name: 'Emma Davis', avatar: '👩‍🔬', status: 'away', mood: 'stressed'},
  ];

  const productivityMetrics: ProductivityMetric[] = [
    {label: 'Tasks Completed', value: 12, change: 20, trend: 'up'},
    {label: 'Focus Time', value: 5.5, change: -10, trend: 'down'},
    {label: 'Team Collaboration', value: 89, change: 5, trend: 'up'},
  ];

  const renderQuickAction = ({item}: {item: QuickAction}) => (
    <TouchableOpacity onPress={item.onPress} activeOpacity={0.8}>
      <GlassCard
        glassTint="dark"
        borderRadius={20}
        style={styles.quickActionCard}
      >
        <View style={[styles.quickActionIcon, {backgroundColor: item.color + '20'}]}>
          <Icon name={item.icon} size={28} color={item.color} />
          {item.badge && (
            <View style={[styles.badge, {backgroundColor: item.color}]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.quickActionTitle}>{item.title}</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  const renderTeamMember = ({item}: {item: TeamMember}) => (
    <TouchableOpacity activeOpacity={0.8}>
      <View style={styles.teamMemberCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <View style={[
            styles.statusIndicator,
            {backgroundColor: getStatusColor(item.status)}
          ]} />
        </View>
        <Text style={styles.memberName}>{item.name.split(' ')[0]}</Text>
        {item.mood && (
          <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'busy': return '#EF4444';
      case 'away': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'stressed': return '😰';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={MetrTheme.colors.dark.background} />
      
      <LinearGradient
        colors={MetrTheme.colors.gradients.dark}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={{opacity: fadeAnim, transform: [{scale: scaleAnim}]}}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning! 👋</Text>
              <Text style={styles.userName}>Welcome back to METR</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <LinearGradient
                colors={MetrTheme.colors.gradients.primary}
                style={styles.profileGradient}
              >
                <Text style={styles.profileEmoji}>👤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* AI Insight Card */}
          <Animated.View style={{transform: [{scale: pulseAnim}]}}>
            <GlassCard glassTint="purple" style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Icon name="robot" size={24} color={MetrTheme.colors.primary.electric} />
                <Text style={styles.aiTitle}>AI Insight</Text>
              </View>
              <Text style={styles.aiInsight}>
                {aiInsight || "📊 Your team's productivity is up 15% this week! Keep up the great momentum."}
              </Text>
              <TouchableOpacity style={styles.aiButton}>
                <Text style={styles.aiButtonText}>Ask AI Assistant →</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* Productivity Score */}
          <GlassCard glassTint="dark" style={styles.productivityCard}>
            <View style={styles.productivityHeader}>
              <Text style={styles.productivityTitle}>Productivity Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{productivityScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={MetrTheme.colors.gradients.primary}
                style={[styles.progressFill, {width: `${productivityScore}%`}]}
              />
            </View>
            <View style={styles.metricsContainer}>
              {productivityMetrics.map((metric, index) => (
                <View key={index} style={styles.metric}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <View style={styles.metricValueContainer}>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <View style={[
                      styles.metricChange,
                      {backgroundColor: metric.trend === 'up' ? '#10B98120' : '#EF444420'}
                    ]}>
                      <Icon
                        name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                        size={12}
                        color={metric.trend === 'up' ? '#10B981' : '#EF4444'}
                      />
                      <Text style={[
                        styles.metricChangeText,
                        {color: metric.trend === 'up' ? '#10B981' : '#EF4444'}
                      ]}>
                        {metric.change}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <FlatList
              data={quickActions}
              renderItem={renderQuickAction}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsList}
            />
          </View>

          {/* Team Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Team Status</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={teamMembers}
              renderItem={renderTeamMember}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamList}
            />
          </View>

          {/* Web3 Status */}
          <GlassCard glassTint="teal" style={styles.web3Card}>
            <View style={styles.web3Header}>
              <Icon name="ethereum" size={24} color={MetrTheme.colors.primary.teal} />
              <Text style={styles.web3Title}>Web3 Status</Text>
            </View>
            <View style={styles.web3Content}>
              <View style={styles.web3Status}>
                <View style={[
                  styles.web3Indicator,
                  {backgroundColor: walletConnected ? '#10B981' : '#6B7280'}
                ]} />
                <Text style={styles.web3StatusText}>
                  {walletConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                </Text>
              </View>
              <TouchableOpacity style={styles.web3Button}>
                <Text style={styles.web3ButtonText}>
                  {walletConnected ? 'View NFTs' : 'Connect Wallet'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <LinearGradient
          colors={MetrTheme.colors.gradients.primary}
          style={styles.fabGradient}
        >
          <Icon name="plus" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
  },
  profileGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  aiCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginLeft: 8,
  },
  aiInsight: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  aiButton: {
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.primary.electric,
  },
  productivityCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  productivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productivityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: MetrTheme.colors.primary.electric,
  },
  scoreMax: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsContainer: {
    gap: 12,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: MetrTheme.colors.primary.electric,
    fontWeight: '500',
  },
  quickActionsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickActionTitle: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    textAlign: 'center',
  },
  teamList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  teamMemberCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    fontSize: 40,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: MetrTheme.colors.dark.background,
  },
  memberName: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 4,
  },
  moodEmoji: {
    fontSize: 16,
  },
  web3Card: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
  },
  web3Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  web3Title: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginLeft: 8,
  },
  web3Content: {
    gap: 12,
  },
  web3Status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  web3Indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  web3StatusText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  web3Button: {
    paddingVertical: 8,
  },
  web3ButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.primary.teal,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...MetrTheme.shadows.lg,
  },
});
