// ProductivityStreaks.tsx - Gamification of Productivity for METR
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Streak {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  name: string;
  description: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  lastCompleted?: Date;
  startDate: Date;
  target: number;
  unit: string;
  progress: number;
  isActive: boolean;
  rewards: Reward[];
}

interface Reward {
  threshold: number;
  name: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  xpReward: number;
}

interface Level {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  perks: string[];
}

const LEVELS: Level[] = [
  {level: 1, title: 'Novice', minXP: 0, maxXP: 100, perks: ['Basic streaks']},
  {level: 2, title: 'Apprentice', minXP: 100, maxXP: 300, perks: ['Custom streaks']},
  {level: 3, title: 'Practitioner', minXP: 300, maxXP: 600, perks: ['Team challenges']},
  {level: 4, title: 'Expert', minXP: 600, maxXP: 1000, perks: ['Streak insurance']},
  {level: 5, title: 'Master', minXP: 1000, maxXP: 1500, perks: ['Double XP events']},
  {level: 6, title: 'Grandmaster', minXP: 1500, maxXP: 2500, perks: ['Legendary rewards']},
  {level: 7, title: 'Legend', minXP: 2500, maxXP: 5000, perks: ['Infinite power']},
];

export const ProductivityStreaks: React.FC = () => {
  const [streaks, setStreaks] = useState<Streak[]>([
    {
      id: 'daily_standup',
      type: 'daily',
      name: 'Daily Standup',
      description: 'Complete your daily standup',
      icon: 'account-group',
      currentStreak: 5,
      longestStreak: 12,
      lastCompleted: new Date(Date.now() - 86400000),
      startDate: new Date(Date.now() - 5 * 86400000),
      target: 1,
      unit: 'standup',
      progress: 100,
      isActive: true,
      rewards: [
        {threshold: 7, name: 'Week Warrior', icon: 'sword', unlocked: false},
        {threshold: 30, name: 'Monthly Master', icon: 'crown', unlocked: false},
        {threshold: 100, name: 'Centurion', icon: 'shield-star', unlocked: false},
      ],
    },
    {
      id: 'code_commits',
      type: 'daily',
      name: 'Code Commits',
      description: 'Push code every day',
      icon: 'source-commit',
      currentStreak: 3,
      longestStreak: 21,
      lastCompleted: new Date(),
      startDate: new Date(Date.now() - 3 * 86400000),
      target: 1,
      unit: 'commit',
      progress: 100,
      isActive: true,
      rewards: [
        {threshold: 10, name: 'Commit Machine', icon: 'robot', unlocked: false},
        {threshold: 50, name: 'Code Ninja', icon: 'ninja', unlocked: false},
      ],
    },
    {
      id: 'focus_time',
      type: 'daily',
      name: 'Focus Time',
      description: '2 hours of deep work',
      icon: 'brain',
      currentStreak: 8,
      longestStreak: 8,
      lastCompleted: new Date(),
      startDate: new Date(Date.now() - 8 * 86400000),
      target: 120,
      unit: 'minutes',
      progress: 75,
      isActive: true,
      rewards: [
        {threshold: 5, name: 'Focus Master', icon: 'meditation', unlocked: true, unlockedDate: new Date(Date.now() - 3 * 86400000)},
        {threshold: 21, name: 'Zen Mode', icon: 'yin-yang', unlocked: false},
      ],
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_streak',
      name: 'First Steps',
      description: 'Start your first streak',
      icon: 'foot-print',
      rarity: 'common',
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      xpReward: 10,
    },
    {
      id: 'week_perfect',
      name: 'Perfect Week',
      description: 'Complete all streaks for 7 days',
      icon: 'calendar-check',
      rarity: 'rare',
      unlocked: false,
      progress: 5,
      maxProgress: 7,
      xpReward: 50,
    },
    {
      id: 'comeback_king',
      name: 'Comeback King',
      description: 'Recover a lost streak',
      icon: 'backup-restore',
      rarity: 'epic',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      xpReward: 100,
    },
    {
      id: 'unstoppable',
      name: 'Unstoppable Force',
      description: '100 day streak on any habit',
      icon: 'infinity',
      rarity: 'legendary',
      unlocked: false,
      progress: 12,
      maxProgress: 100,
      xpReward: 500,
    },
  ]);

  const [userXP, setUserXP] = useState(450);
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[2]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedStreak, setSelectedStreak] = useState<Streak | null>(null);
  
  const fireAnimation = React.useRef(new Animated.Value(1)).current;
  const levelUpAnimation = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStreakData();
    checkDailyReset();
    animateFire();
  }, []);

  const loadStreakData = async () => {
    try {
      const saved = await AsyncStorage.getItem('productivity_streaks');
      if (saved) {
        setStreaks(JSON.parse(saved));
      }
      
      const savedXP = await AsyncStorage.getItem('user_xp');
      if (savedXP) {
        const xp = parseInt(savedXP);
        setUserXP(xp);
        updateLevel(xp);
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  };

  const checkDailyReset = () => {
    const now = new Date();
    streaks.forEach(streak => {
      if (streak.type === 'daily' && streak.lastCompleted) {
        const lastDate = new Date(streak.lastCompleted);
        const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / 86400000);
        
        if (daysDiff > 1) {
          // Streak broken
          streak.currentStreak = 0;
          streak.isActive = false;
          showStreakBroken(streak);
        } else if (daysDiff === 1) {
          // Ready for today
          streak.progress = 0;
        }
      }
    });
  };

  const animateFire = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fireAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fireAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const completeStreakTask = (streakId: string, progress: number = 100) => {
    const updatedStreaks = streaks.map(streak => {
      if (streak.id === streakId) {
        const newProgress = Math.min(100, streak.progress + progress);
        
        if (newProgress === 100 && streak.progress < 100) {
          // Streak completed for today
          streak.currentStreak++;
          streak.lastCompleted = new Date();
          streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
          
          // Check rewards
          streak.rewards.forEach(reward => {
            if (!reward.unlocked && streak.currentStreak >= reward.threshold) {
              reward.unlocked = true;
              reward.unlockedDate = new Date();
              showRewardUnlocked(reward);
              addXP(reward.threshold * 10);
            }
          });
          
          // Check achievements
          checkAchievements(streak);
        }
        
        streak.progress = newProgress;
      }
      return streak;
    });
    
    setStreaks(updatedStreaks);
    saveStreakData(updatedStreaks);
  };

  const checkAchievements = (streak: Streak) => {
    const updatedAchievements = achievements.map(achievement => {
      switch (achievement.id) {
        case 'week_perfect':
          if (streaks.every(s => s.currentStreak >= 7)) {
            achievement.unlocked = true;
            addXP(achievement.xpReward);
          }
          break;
        case 'unstoppable':
          if (streak.currentStreak >= 100) {
            achievement.unlocked = true;
            addXP(achievement.xpReward);
          }
          break;
      }
      return achievement;
    });
    
    setAchievements(updatedAchievements);
  };

  const addXP = (amount: number) => {
    const newXP = userXP + amount;
    setUserXP(newXP);
    updateLevel(newXP);
    AsyncStorage.setItem('user_xp', newXP.toString());
  };

  const updateLevel = (xp: number) => {
    const newLevel = LEVELS.find(level => xp >= level.minXP && xp < level.maxXP) || LEVELS[0];
    
    if (newLevel.level > currentLevel.level) {
      showLevelUpAnimation();
    }
    
    setCurrentLevel(newLevel);
  };

  const showLevelUpAnimation = () => {
    setShowLevelUp(true);
    Animated.sequence([
      Animated.timing(levelUpAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(levelUpAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowLevelUp(false));
  };

  const showStreakBroken = (streak: Streak) => {
    // Show notification
    console.log(`Streak broken: ${streak.name}`);
  };

  const showRewardUnlocked = (reward: Reward) => {
    // Show reward animation
    console.log(`Reward unlocked: ${reward.name}`);
  };

  const useStreakFreeze = (streakId: string) => {
    // Use streak freeze power-up
    const streak = streaks.find(s => s.id === streakId);
    if (streak) {
      streak.lastCompleted = new Date();
      saveStreakData(streaks);
    }
  };

  const saveStreakData = async (data: Streak[]) => {
    try {
      await AsyncStorage.setItem('productivity_streaks', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 100) return '#FFD700'; // Gold
    if (streak >= 50) return '#C0C0C0'; // Silver
    if (streak >= 30) return '#CD7F32'; // Bronze
    if (streak >= 7) return MetrTheme.colors.primary.electric;
    return MetrTheme.colors.primary.teal;
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#A020F0';
      case 'rare': return '#0080FF';
      default: return '#808080';
    }
  };

  const renderStreak = (streak: Streak) => (
    <GlassCard key={streak.id} style={styles.streakCard}>
      <TouchableOpacity onPress={() => setSelectedStreak(streak)}>
        <View style={styles.streakHeader}>
          <View style={[styles.streakIcon, {backgroundColor: getStreakColor(streak.currentStreak) + '20'}]}>
            <Icon name={streak.icon} size={32} color={getStreakColor(streak.currentStreak)} />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakName}>{streak.name}</Text>
            <Text style={styles.streakDescription}>{streak.description}</Text>
          </View>
          {streak.currentStreak > 0 && (
            <Animated.View style={[styles.fireContainer, {transform: [{scale: fireAnimation}]}]}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{streak.currentStreak}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${streak.progress}%`}]} />
        </View>
        
        <View style={styles.streakStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Current</Text>
            <Text style={styles.statValue}>{streak.currentStreak} days</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={styles.statValue}>{streak.longestStreak} days</Text>
          </View>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => completeStreakTask(streak.id)}
            disabled={streak.progress === 100}
          >
            <Text style={styles.completeButtonText}>
              {streak.progress === 100 ? '✅ Done' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rewards */}
        <View style={styles.rewards}>
          {streak.rewards.map(reward => (
            <View 
              key={reward.threshold}
              style={[
                styles.rewardBadge,
                reward.unlocked && styles.rewardUnlocked,
              ]}
            >
              <Icon 
                name={reward.icon} 
                size={20} 
                color={reward.unlocked ? '#FFD700' : MetrTheme.colors.dark.textSecondary} 
              />
              <Text style={styles.rewardThreshold}>{reward.threshold}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </GlassCard>
  );

  const renderAchievement = (achievement: Achievement) => (
    <View 
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.unlocked && styles.achievementUnlocked,
      ]}
    >
      <View style={[
        styles.achievementIcon,
        {backgroundColor: getRarityColor(achievement.rarity) + '20'},
      ]}>
        <Icon 
          name={achievement.icon} 
          size={24} 
          color={achievement.unlocked ? getRarityColor(achievement.rarity) : MetrTheme.colors.dark.textSecondary} 
        />
      </View>
      <Text style={styles.achievementName}>{achievement.name}</Text>
      <View style={styles.achievementProgress}>
        <View 
          style={[
            styles.achievementProgressFill,
            {
              width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
              backgroundColor: getRarityColor(achievement.rarity),
            }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header with Level */}
      <LinearGradient
        colors={[MetrTheme.colors.primary.electric, MetrTheme.colors.primary.teal]}
        style={styles.header}
      >
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level {currentLevel.level}</Text>
          <Text style={styles.levelTitle}>{currentLevel.title}</Text>
        </View>
        
        <View style={styles.xpBar}>
          <View 
            style={[
              styles.xpFill,
              {width: `${((userXP - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100}%`}
            ]} 
          />
        </View>
        
        <Text style={styles.xpText}>
          {userXP} / {currentLevel.maxXP} XP
        </Text>
      </LinearGradient>

      {/* Level Up Animation */}
      {showLevelUp && (
        <Animated.View 
          style={[
            styles.levelUpContainer,
            {
              opacity: levelUpAnimation,
              transform: [{scale: levelUpAnimation}],
            }
          ]}
        >
          <Text style={styles.levelUpText}>🎉 LEVEL UP! 🎉</Text>
          <Text style={styles.levelUpSubtext}>You are now {currentLevel.title}</Text>
        </Animated.View>
      )}

      {/* Daily Streaks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Active Streaks</Text>
        {streaks.map(renderStreak)}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map(renderAchievement)}
        </View>
      </View>

      {/* Leaderboard Preview */}
      <GlassCard style={styles.leaderboardCard}>
        <Text style={styles.leaderboardTitle}>🏅 Team Leaderboard</Text>
        <View style={styles.leaderboardItem}>
          <Text style={styles.leaderboardRank}>1</Text>
          <Text style={styles.leaderboardName}>Sarah</Text>
          <Text style={styles.leaderboardStreak}>156 🔥</Text>
        </View>
        <View style={styles.leaderboardItem}>
          <Text style={styles.leaderboardRank}>2</Text>
          <Text style={styles.leaderboardName}>You</Text>
          <Text style={styles.leaderboardStreak}>87 🔥</Text>
        </View>
        <View style={styles.leaderboardItem}>
          <Text style={styles.leaderboardRank}>3</Text>
          <Text style={styles.leaderboardName}>Mike</Text>
          <Text style={styles.leaderboardStreak}>45 🔥</Text>
        </View>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  levelInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  xpBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  levelUpContainer: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  levelUpText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  levelUpSubtext: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  streakCard: {
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
    marginLeft: 12,
  },
  streakName: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  streakDescription: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  fireContainer: {
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 32,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: MetrTheme.colors.primary.teal,
    borderRadius: 3,
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 2,
  },
  completeButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rewards: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  rewardBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardUnlocked: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  rewardThreshold: {
    fontSize: 10,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 10,
    color: MetrTheme.colors.dark.text,
    textAlign: 'center',
  },
  achievementProgress: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    marginTop: 6,
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 1,
  },
  leaderboardCard: {
    margin: 20,
    padding: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: '700',
    color: MetrTheme.colors.primary.electric,
    width: 30,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
  },
  leaderboardStreak: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
});
