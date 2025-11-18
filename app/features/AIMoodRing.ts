// AIMoodRing.ts - Real-time team mood visualization
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIManager from '../ai/core/AIManager';

export interface TeamMoodData {
  overall: MoodState;
  individual: Map<string, MoodState>;
  energy: number;
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
  timestamp: Date;
}

export type MoodState = 'happy' | 'neutral' | 'stressed' | 'excited' | 'focused' | 'frustrated' | 'tired';

interface MoodIndicator {
  emoji: string;
  color: string;
  description: string;
  productivity: number;
}

export class AIMoodRing {
  private static instance: AIMoodRing;
  private aiManager: typeof AIManager;
  private currentMood: TeamMoodData | null = null;
  private moodHistory: TeamMoodData[] = [];
  private updateInterval: any = null;
  
  private moodIndicators: Record<MoodState, MoodIndicator> = {
    happy: {emoji: '😊', color: '#10B981', description: 'Team is happy and productive', productivity: 90},
    excited: {emoji: '🤩', color: '#EC4899', description: 'High energy and enthusiasm', productivity: 95},
    focused: {emoji: '🎯', color: '#8B5CF6', description: 'Deep focus mode', productivity: 100},
    neutral: {emoji: '😐', color: '#6B7280', description: 'Steady state', productivity: 70},
    stressed: {emoji: '😰', color: '#EF4444', description: 'Under pressure', productivity: 60},
    frustrated: {emoji: '😤', color: '#F59E0B', description: 'Facing challenges', productivity: 50},
    tired: {emoji: '😴', color: '#3B82F6', description: 'Low energy', productivity: 40},
  };

  private constructor() {
    this.aiManager = AIManager.getInstance();
    this.startRealTimeMonitoring();
  }

  public static getInstance(): AIMoodRing {
    if (!AIMoodRing.instance) {
      AIMoodRing.instance = new AIMoodRing();
    }
    return AIMoodRing.instance;
  }

  private async startRealTimeMonitoring() {
    // Update mood every 5 minutes
    this.updateInterval = setInterval(async () => {
      await this.analyzeMood();
    }, 5 * 60 * 1000);
    
    // Initial analysis
    await this.analyzeMood();
  }

  public async analyzeMood(): Promise<TeamMoodData> {
    try {
      // Get emotion analysis from AI
      const messages = await this.getRecentMessages();
      const emotions = await this.aiManager.analyzeEmotions(messages);
      
      // Calculate energy level
      const energy = this.calculateEnergyLevel(emotions);
      
      // Generate insights
      const insights = this.generateMoodInsights(emotions.overall, energy);
      
      const moodData: TeamMoodData = {
        overall: emotions.overall as MoodState,
        individual: emotions.individual,
        energy,
        trend: emotions.trend,
        insights,
        timestamp: new Date(),
      };
      
      this.currentMood = moodData;
      this.moodHistory.push(moodData);
      
      // Keep only last 100 entries
      if (this.moodHistory.length > 100) {
        this.moodHistory.shift();
      }
      
      // Save to storage
      await this.saveMoodData(moodData);
      
      // Trigger notifications if needed
      await this.checkMoodAlerts(moodData);
      
      return moodData;
    } catch (error) {
      console.error('Failed to analyze mood:', error);
      return this.getDefaultMoodData();
    }
  }

  private async getRecentMessages(): Promise<any[]> {
    // Get last 50 messages from team
    // This would integrate with the messaging system
    return [];
  }

  private calculateEnergyLevel(emotions: any): number {
    const moodEnergy = {
      happy: 85,
      excited: 95,
      focused: 80,
      neutral: 60,
      stressed: 40,
      frustrated: 35,
      tired: 20,
    };
    
    const baseEnergy = moodEnergy[emotions.overall as MoodState] || 50;
    
    // Factor in time of day
    const hour = new Date().getHours();
    let timeModifier = 1;
    
    if (hour >= 9 && hour <= 11) timeModifier = 1.1; // Morning boost
    else if (hour >= 14 && hour <= 15) timeModifier = 0.8; // Post-lunch dip
    else if (hour >= 16 && hour <= 17) timeModifier = 1.05; // Late afternoon surge
    else if (hour >= 20) timeModifier = 0.7; // Evening decline
    
    return Math.round(baseEnergy * timeModifier);
  }

  private generateMoodInsights(mood: string, energy: number): string[] {
    const insights: string[] = [];
    
    if (mood === 'stressed') {
      insights.push('Consider a team break or wellness check-in');
      insights.push('Review workload distribution');
    } else if (mood === 'excited') {
      insights.push('Great time for creative brainstorming');
      insights.push('Channel enthusiasm into new initiatives');
    } else if (mood === 'focused') {
      insights.push('Ideal for deep work sessions');
      insights.push('Minimize interruptions to maintain flow');
    }
    
    if (energy < 40) {
      insights.push('Low energy detected - schedule breaks');
    } else if (energy > 80) {
      insights.push('High energy - tackle challenging tasks');
    }
    
    return insights;
  }

  private async saveMoodData(data: TeamMoodData) {
    await AsyncStorage.setItem('team_mood_current', JSON.stringify(data));
    
    // Save to history
    const historyKey = `mood_history_${new Date().toISOString().split('T')[0]}`;
    const existingHistory = await AsyncStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.push(data);
    await AsyncStorage.setItem(historyKey, JSON.stringify(history));
  }

  private async checkMoodAlerts(data: TeamMoodData) {
    // Alert if stress levels are high
    if (data.overall === 'stressed' || data.overall === 'frustrated') {
      // Send notification to team lead
      console.log('Alert: Team mood requires attention');
    }
    
    // Alert on significant mood shifts
    if (this.moodHistory.length > 1) {
      const previousMood = this.moodHistory[this.moodHistory.length - 2];
      if (this.getMoodScore(data.overall) < this.getMoodScore(previousMood.overall) - 30) {
        console.log('Alert: Significant mood decline detected');
      }
    }
  }

  private getMoodScore(mood: MoodState): number {
    const scores = {
      excited: 100,
      happy: 90,
      focused: 85,
      neutral: 60,
      tired: 40,
      stressed: 30,
      frustrated: 20,
    };
    return scores[mood] || 50;
  }

  public getCurrentMood(): TeamMoodData | null {
    return this.currentMood;
  }

  public getMoodHistory(): TeamMoodData[] {
    return this.moodHistory;
  }

  public getMoodIndicator(mood: MoodState): MoodIndicator {
    return this.moodIndicators[mood];
  }

  public async getMoodTrends(days: number = 7): Promise<any> {
    const trends = {
      daily: [] as any[],
      weekly: [] as any[],
      topMoods: new Map<MoodState, number>(),
    };
    
    // Analyze historical data
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const historyKey = `mood_history_${date.toISOString().split('T')[0]}`;
      const dayHistory = await AsyncStorage.getItem(historyKey);
      
      if (dayHistory) {
        const data = JSON.parse(dayHistory);
        trends.daily.push({
          date: date.toISOString().split('T')[0],
          avgMood: this.calculateAverageMood(data),
          avgEnergy: this.calculateAverageEnergy(data),
        });
        
        // Count mood occurrences
        data.forEach((entry: TeamMoodData) => {
          const count = trends.topMoods.get(entry.overall) || 0;
          trends.topMoods.set(entry.overall, count + 1);
        });
      }
    }
    
    return trends;
  }

  private calculateAverageMood(data: TeamMoodData[]): number {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, entry) => sum + this.getMoodScore(entry.overall), 0);
    return total / data.length;
  }

  private calculateAverageEnergy(data: TeamMoodData[]): number {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, entry) => sum + entry.energy, 0);
    return total / data.length;
  }

  private getDefaultMoodData(): TeamMoodData {
    return {
      overall: 'neutral',
      individual: new Map(),
      energy: 50,
      trend: 'stable',
      insights: ['Unable to analyze mood at this time'],
      timestamp: new Date(),
    };
  }

  public stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export default AIMoodRing;
