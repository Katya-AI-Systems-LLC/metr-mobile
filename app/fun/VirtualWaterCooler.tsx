// VirtualWaterCooler.tsx - Random Coffee Breaks & Team Bonding
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CoffeeBreak {
  id: string;
  participants: Participant[];
  scheduledTime: Date;
  topic?: string;
  icebreaker?: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  duration: number;
  mood?: 'great' | 'good' | 'okay' | 'awkward';
  notes?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  department: string;
  interests: string[];
  coffeeCount: number;
  lastCoffee?: Date;
}

interface IceBreaker {
  category: 'fun' | 'work' | 'personal' | 'creative' | 'philosophical';
  question: string;
  difficulty: 'easy' | 'medium' | 'spicy';
}

const ICEBREAKERS: IceBreaker[] = [
  {category: 'fun', question: "What's your most useless talent?", difficulty: 'easy'},
  {category: 'work', question: "What's the weirdest bug you've ever encountered?", difficulty: 'medium'},
  {category: 'personal', question: "What's your guilty pleasure TV show?", difficulty: 'easy'},
  {category: 'creative', question: "If you could rename our project, what would it be?", difficulty: 'medium'},
  {category: 'philosophical', question: "Is a hot dog a sandwich? Defend your answer.", difficulty: 'spicy'},
  {category: 'fun', question: "What's your zombie apocalypse survival plan?", difficulty: 'medium'},
  {category: 'work', question: "What's your dream feature that's too crazy to build?", difficulty: 'spicy'},
  {category: 'personal', question: "Coffee or tea, and why is the other one wrong?", difficulty: 'easy'},
];

const TOPICS = [
  "Latest tech trends",
  "Weekend adventures",
  "Favorite podcasts",
  "Hidden talents",
  "Dream vacation",
  "Best remote work tips",
  "Funny pet stories",
  "Cooking disasters",
];

export const VirtualWaterCooler: React.FC = () => {
  const [currentBreak, setCurrentBreak] = useState<CoffeeBreak | null>(null);
  const [upcomingBreaks, setUpcomingBreaks] = useState<CoffeeBreak[]>([]);
  const [pastBreaks, setPastBreaks] = useState<CoffeeBreak[]>([]);
  const [myProfile, setMyProfile] = useState<Participant>({
    id: 'user_1',
    name: 'You',
    avatar: 'https://i.pravatar.cc/150?img=1',
    department: 'Engineering',
    interests: ['coding', 'coffee', 'music'],
    coffeeCount: 0,
  });
  const [isInBreak, setIsInBreak] = useState(false);
  const [breakTimer, setBreakTimer] = useState(0);

  const teammates: Participant[] = [
    {
      id: 'user_2',
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      department: 'Design',
      interests: ['UI/UX', 'photography', 'hiking'],
      coffeeCount: 12,
    },
    {
      id: 'user_3',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      department: 'Product',
      interests: ['strategy', 'yoga', 'reading'],
      coffeeCount: 8,
    },
    {
      id: 'user_4',
      name: 'Mike Williams',
      avatar: 'https://i.pravatar.cc/150?img=4',
      department: 'Marketing',
      interests: ['growth', 'gaming', 'cooking'],
      coffeeCount: 15,
    },
    {
      id: 'user_5',
      name: 'Emma Davis',
      avatar: 'https://i.pravatar.cc/150?img=5',
      department: 'Engineering',
      interests: ['backend', 'music', 'travel'],
      coffeeCount: 10,
    },
  ];

  useEffect(() => {
    loadBreakHistory();
    scheduleNextBreak();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isInBreak && currentBreak) {
      interval = setInterval(() => {
        setBreakTimer(prev => {
          if (prev >= currentBreak.duration * 60) {
            endBreak();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInBreak, currentBreak]);

  const loadBreakHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('coffee_break_history');
      if (history) {
        setPastBreaks(JSON.parse(history));
      }
    } catch (error) {
      console.error('Failed to load break history:', error);
    }
  };

  const scheduleNextBreak = () => {
    // Schedule random coffee break
    const randomTeammate = teammates[Math.floor(Math.random() * teammates.length)];
    const randomIcebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    
    const nextBreak: CoffeeBreak = {
      id: `break_${Date.now()}`,
      participants: [myProfile, randomTeammate],
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      topic: randomTopic,
      icebreaker: randomIcebreaker.question,
      status: 'pending',
      duration: 15, // 15 minutes
    };
    
    setUpcomingBreaks([nextBreak]);
  };

  const startBreak = (coffeeBreak: CoffeeBreak) => {
    setCurrentBreak({...coffeeBreak, status: 'active'});
    setIsInBreak(true);
    setBreakTimer(0);
    
    Alert.alert(
      '☕ Coffee Break Time!',
      `Time to chat with ${coffeeBreak.participants[1].name}`,
      [{text: "Let's go!", style: 'default'}]
    );
  };

  const endBreak = async () => {
    if (!currentBreak) return;
    
    const completedBreak = {
      ...currentBreak,
      status: 'completed' as const,
      mood: 'great' as const,
    };
    
    const updatedHistory = [...pastBreaks, completedBreak];
    setPastBreaks(updatedHistory);
    await AsyncStorage.setItem('coffee_break_history', JSON.stringify(updatedHistory));
    
    setCurrentBreak(null);
    setIsInBreak(false);
    setBreakTimer(0);
    
    // Update coffee count
    setMyProfile(prev => ({...prev, coffeeCount: prev.coffeeCount + 1}));
    
    // Schedule next break
    scheduleNextBreak();
  };

  const skipBreak = (breakId: string) => {
    setUpcomingBreaks(prev => 
      prev.map(b => b.id === breakId ? {...b, status: 'skipped'} : b)
    );
    scheduleNextBreak();
  };

  const instantCoffee = () => {
    // Instantly match with someone available
    const available = teammates.filter(t => 
      !t.lastCoffee || new Date().getTime() - t.lastCoffee.getTime() > 3600000
    );
    
    if (available.length === 0) {
      Alert.alert('No one available', 'Everyone is busy right now. Try again later!');
      return;
    }
    
    const partner = available[Math.floor(Math.random() * available.length)];
    const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    
    const instantBreak: CoffeeBreak = {
      id: `instant_${Date.now()}`,
      participants: [myProfile, partner],
      scheduledTime: new Date(),
      icebreaker: icebreaker.question,
      status: 'pending',
      duration: 10,
    };
    
    startBreak(instantBreak);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCurrentBreak = () => {
    if (!currentBreak || !isInBreak) return null;
    
    const partner = currentBreak.participants.find(p => p.id !== myProfile.id);
    if (!partner) return null;
    
    return (
      <GlassCard style={styles.currentBreakCard}>
        <View style={styles.breakHeader}>
          <Text style={styles.breakTitle}>☕ Coffee Break in Progress</Text>
          <Text style={styles.breakTimer}>{formatTime(breakTimer)}</Text>
        </View>
        
        <View style={styles.participants}>
          <View style={styles.participant}>
            <Image source={{uri: myProfile.avatar}} style={styles.avatar} />
            <Text style={styles.participantName}>You</Text>
          </View>
          
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>☕</Text>
          </View>
          
          <View style={styles.participant}>
            <Image source={{uri: partner.avatar}} style={styles.avatar} />
            <Text style={styles.participantName}>{partner.name}</Text>
          </View>
        </View>
        
        {currentBreak.icebreaker && (
          <View style={styles.icebreakerCard}>
            <Text style={styles.icebreakerLabel}>🎲 Icebreaker Question:</Text>
            <Text style={styles.icebreakerQuestion}>{currentBreak.icebreaker}</Text>
          </View>
        )}
        
        {currentBreak.topic && (
          <View style={styles.topicCard}>
            <Text style={styles.topicLabel}>💬 Suggested Topic:</Text>
            <Text style={styles.topicText}>{currentBreak.topic}</Text>
          </View>
        )}
        
        <View style={styles.breakActions}>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>😊</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>😂</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>🤔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>💡</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.endBreakButton} onPress={endBreak}>
          <Text style={styles.endBreakButtonText}>End Break</Text>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const renderUpcomingBreaks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📅 Upcoming Coffee Breaks</Text>
      
      {upcomingBreaks.filter(b => b.status === 'pending').map(coffeeBreak => {
        const partner = coffeeBreak.participants.find(p => p.id !== myProfile.id);
        if (!partner) return null;
        
        return (
          <GlassCard key={coffeeBreak.id} style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <Image source={{uri: partner.avatar}} style={styles.smallAvatar} />
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingName}>{partner.name}</Text>
                <Text style={styles.upcomingTime}>
                  {coffeeBreak.scheduledTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </Text>
              </View>
              <View style={styles.upcomingActions}>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => startBreak(coffeeBreak)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => skipBreak(coffeeBreak.id)}
                >
                  <Icon name="close" size={20} color={MetrTheme.colors.semantic.error} />
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        );
      })}
    </View>
  );

  const renderStats = () => (
    <GlassCard style={styles.statsCard}>
      <Text style={styles.statsTitle}>☕ Your Coffee Stats</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{myProfile.coffeeCount}</Text>
          <Text style={styles.statLabel}>Total Breaks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teammates.length}</Text>
          <Text style={styles.statLabel}>Teammates Met</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(myProfile.coffeeCount * 15 / 60)}h
          </Text>
          <Text style={styles.statLabel}>Time Bonding</Text>
        </View>
      </View>
      
      <View style={styles.leaderboard}>
        <Text style={styles.leaderboardTitle}>🏆 Coffee Champions</Text>
        {[...teammates]
          .sort((a, b) => b.coffeeCount - a.coffeeCount)
          .slice(0, 3)
          .map((person, index) => (
            <View key={person.id} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>#{index + 1}</Text>
              <Image source={{uri: person.avatar}} style={styles.leaderboardAvatar} />
              <Text style={styles.leaderboardName}>{person.name}</Text>
              <Text style={styles.leaderboardCount}>{person.coffeeCount} ☕</Text>
            </View>
          ))}
      </View>
    </GlassCard>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>☕ Virtual Water Cooler</Text>
        <Text style={styles.subtitle}>Random coffee breaks for team bonding</Text>
      </View>
      
      {!isInBreak && (
        <TouchableOpacity style={styles.instantButton} onPress={instantCoffee}>
          <Icon name="coffee" size={24} color="#FFFFFF" />
          <Text style={styles.instantButtonText}>Instant Coffee Break</Text>
          <Text style={styles.instantButtonSubtext}>Match with someone available now</Text>
        </TouchableOpacity>
      )}
      
      {renderCurrentBreak()}
      {!isInBreak && renderUpcomingBreaks()}
      {renderStats()}
      
      <GlassCard style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Coffee Break Tips</Text>
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>🎯</Text>
          <Text style={styles.tipText}>Keep it casual - no work talk required!</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>⏰</Text>
          <Text style={styles.tipText}>15 minutes is perfect - not too short, not too long</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>🎲</Text>
          <Text style={styles.tipText}>Use icebreakers if conversation gets stuck</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>🌟</Text>
          <Text style={styles.tipText}>Meet someone new each week</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  subtitle: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  instantButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  instantButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  instantButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  currentBreakCard: {
    margin: 20,
    padding: 20,
  },
  breakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  breakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  breakTimer: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.primary.teal,
  },
  participants: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  participant: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
  },
  vsContainer: {
    marginHorizontal: 30,
  },
  vsText: {
    fontSize: 32,
  },
  icebreakerCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  icebreakerLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 8,
  },
  icebreakerQuestion: {
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
    fontWeight: '500',
  },
  topicCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  topicLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
  },
  breakActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reactionButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  endBreakButton: {
    backgroundColor: MetrTheme.colors.semantic.error,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  endBreakButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  upcomingCard: {
    padding: 16,
    marginBottom: 12,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  upcomingName: {
    fontSize: 16,
    fontWeight: '500',
    color: MetrTheme.colors.dark.text,
  },
  upcomingTime: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  upcomingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: MetrTheme.colors.primary.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    padding: 8,
  },
  statsCard: {
    margin: 20,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: MetrTheme.colors.primary.electric,
  },
  statLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  leaderboard: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardRank: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.primary.pink,
    width: 30,
  },
  leaderboardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 12,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
  },
  leaderboardCount: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  tipsCard: {
    margin: 20,
    padding: 20,
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
});
