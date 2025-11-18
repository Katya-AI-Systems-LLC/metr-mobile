// ProductivityInsights.ts - AI-powered productivity analytics
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AIConfig} from '../core/AIManager';

export interface ProductivityScore {
  score: number; // 0-100
  insights: string[];
  recommendations: string[];
  breakdown: {
    focusTime: number;
    collaborationScore: number;
    taskCompletion: number;
    responsiveness: number;
    workLifeBalance: number;
  };
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  comparisons: {
    vsYesterday: number;
    vsLastWeek: number;
    vsTeamAverage: number;
  };
}

export interface ProductivityPattern {
  type: 'peak' | 'low' | 'consistent' | 'erratic';
  timeOfDay: string;
  dayOfWeek?: string;
  description: string;
  recommendation: string;
}

export interface WorkSession {
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'deep-work' | 'collaboration' | 'meetings' | 'break';
  productivity: number;
  distractions: number;
}

export class ProductivityInsights {
  private config: AIConfig | null = null;
  private sessions: Map<string, WorkSession[]>;
  private patterns: Map<string, ProductivityPattern[]>;
  private metrics: Map<string, any>;
  
  constructor() {
    this.sessions = new Map();
    this.patterns = new Map();
    this.metrics = new Map();
  }

  public async initialize(config: AIConfig): Promise<void> {
    this.config = config;
    await this.loadHistoricalData();
  }

  private async loadHistoricalData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('productivity_data');
      if (data) {
        const parsed = JSON.parse(data);
        // Load historical sessions and patterns
        if (parsed.sessions) {
          Object.entries(parsed.sessions).forEach(([userId, sessions]) => {
            this.sessions.set(userId, sessions as WorkSession[]);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load productivity data:', error);
    }
  }

  public async calculateScore(
    userId: string,
    timeRange?: {start: Date; end: Date}
  ): Promise<ProductivityScore> {
    try {
      // Get user sessions
      const userSessions = this.getUserSessions(userId, timeRange);
      
      // Calculate individual metrics
      const focusTime = this.calculateFocusTime(userSessions);
      const collaborationScore = this.calculateCollaborationScore(userSessions);
      const taskCompletion = await this.calculateTaskCompletion(userId, timeRange);
      const responsiveness = this.calculateResponsiveness(userId);
      const workLifeBalance = this.calculateWorkLifeBalance(userSessions);
      
      // Calculate overall score
      const score = this.calculateOverallScore({
        focusTime,
        collaborationScore,
        taskCompletion,
        responsiveness,
        workLifeBalance
      });
      
      // Generate insights
      const insights = this.generateInsights(userId, {
        score,
        focusTime,
        collaborationScore,
        taskCompletion,
        responsiveness,
        workLifeBalance
      });
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(userId, {
        score,
        focusTime,
        collaborationScore,
        taskCompletion,
        responsiveness,
        workLifeBalance
      }, insights);
      
      // Calculate trends
      const trends = await this.calculateTrends(userId);
      
      // Calculate comparisons
      const comparisons = await this.calculateComparisons(userId, score);
      
      return {
        score,
        insights,
        recommendations,
        breakdown: {
          focusTime,
          collaborationScore,
          taskCompletion,
          responsiveness,
          workLifeBalance
        },
        trends,
        comparisons
      };
    } catch (error) {
      console.error('Failed to calculate productivity score:', error);
      return this.getDefaultScore();
    }
  }

  private getUserSessions(
    userId: string,
    timeRange?: {start: Date; end: Date}
  ): WorkSession[] {
    const sessions = this.sessions.get(userId) || [];
    
    if (!timeRange) {
      // Return today's sessions by default
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return sessions.filter(s => s.startTime >= today);
    }
    
    return sessions.filter(s => 
      s.startTime >= timeRange.start && s.endTime <= timeRange.end
    );
  }

  private calculateFocusTime(sessions: WorkSession[]): number {
    const deepWorkSessions = sessions.filter(s => s.type === 'deep-work');
    const totalMinutes = deepWorkSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Score based on recommended 4 hours of deep work per day
    const targetMinutes = 240; // 4 hours
    const percentage = Math.min((totalMinutes / targetMinutes) * 100, 100);
    
    return Math.round(percentage);
  }

  private calculateCollaborationScore(sessions: WorkSession[]): number {
    const collaborationSessions = sessions.filter(s => s.type === 'collaboration' || s.type === 'meetings');
    
    if (collaborationSessions.length === 0) return 50; // Neutral score
    
    // Calculate effectiveness based on productivity ratings
    const avgProductivity = collaborationSessions.reduce((sum, s) => sum + s.productivity, 0) / 
                           collaborationSessions.length;
    
    // Balance between too many and too few meetings
    const meetingRatio = collaborationSessions.length / sessions.length;
    const idealRatio = 0.3; // 30% collaboration is ideal
    const ratioPenalty = Math.abs(meetingRatio - idealRatio) * 50;
    
    return Math.round(Math.max(0, avgProductivity - ratioPenalty));
  }

  private async calculateTaskCompletion(
    userId: string,
    timeRange?: {start: Date; end: Date}
  ): Promise<number> {
    // This would integrate with task management system
    // Simplified implementation
    const completedTasks = Math.floor(Math.random() * 10) + 5;
    const totalTasks = completedTasks + Math.floor(Math.random() * 5);
    
    return Math.round((completedTasks / totalTasks) * 100);
  }

  private calculateResponsiveness(userId: string): number {
    // Measure response time to messages and mentions
    // Simplified implementation
    const avgResponseTime = Math.random() * 60; // minutes
    
    if (avgResponseTime < 15) return 95;
    if (avgResponseTime < 30) return 80;
    if (avgResponseTime < 60) return 65;
    return 50;
  }

  private calculateWorkLifeBalance(sessions: WorkSession[]): number {
    if (sessions.length === 0) return 70;
    
    // Check working hours
    const afterHoursSessions = sessions.filter(s => {
      const hour = s.startTime.getHours();
      return hour < 9 || hour > 18;
    });
    
    const afterHoursRatio = afterHoursSessions.length / sessions.length;
    
    // Check break frequency
    const breaks = sessions.filter(s => s.type === 'break');
    const breakRatio = breaks.length / sessions.length;
    
    // Calculate score
    let score = 100;
    score -= afterHoursRatio * 50; // Penalty for after-hours work
    score += breakRatio * 20; // Bonus for taking breaks
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private calculateOverallScore(breakdown: any): number {
    const weights = {
      focusTime: 0.3,
      collaborationScore: 0.2,
      taskCompletion: 0.25,
      responsiveness: 0.15,
      workLifeBalance: 0.1
    };
    
    let weightedSum = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      weightedSum += breakdown[key] * weight;
    });
    
    return Math.round(weightedSum);
  }

  private generateInsights(userId: string, metrics: any): string[] {
    const insights: string[] = [];
    
    // Focus time insights
    if (metrics.focusTime < 50) {
      insights.push('📊 Your deep work time is below optimal. Consider blocking dedicated focus hours.');
    } else if (metrics.focusTime > 80) {
      insights.push('🎯 Excellent focus time! You\'re in the productivity zone.');
    }
    
    // Collaboration insights
    if (metrics.collaborationScore < 40) {
      insights.push('🤝 Meeting effectiveness could be improved. Consider shorter, more focused meetings.');
    }
    
    // Task completion insights
    if (metrics.taskCompletion > 85) {
      insights.push('✅ Outstanding task completion rate! Keep up the momentum.');
    } else if (metrics.taskCompletion < 60) {
      insights.push('📝 Task completion is below target. Consider prioritizing or delegating.');
    }
    
    // Work-life balance insights
    if (metrics.workLifeBalance < 50) {
      insights.push('⚖️ Work-life balance needs attention. Remember to disconnect and recharge.');
    }
    
    // Overall insights
    if (metrics.score > 80) {
      insights.push('🚀 You\'re performing at peak productivity!');
    } else if (metrics.score < 50) {
      insights.push('💡 There\'s significant room for productivity improvement.');
    }
    
    return insights;
  }

  private generateRecommendations(userId: string, metrics: any, insights: string[]): string[] {
    const recommendations: string[] = [];
    
    // Focus time recommendations
    if (metrics.focusTime < 50) {
      recommendations.push('Block 2-4 hours daily for uninterrupted deep work');
      recommendations.push('Use "Do Not Disturb" mode during focus sessions');
      recommendations.push('Try the Pomodoro Technique (25 min work, 5 min break)');
    }
    
    // Collaboration recommendations
    if (metrics.collaborationScore < 60) {
      recommendations.push('Set clear agendas for all meetings');
      recommendations.push('Consider async communication for status updates');
      recommendations.push('Implement "No Meeting Fridays" for deep work');
    }
    
    // Task completion recommendations
    if (metrics.taskCompletion < 70) {
      recommendations.push('Break large tasks into smaller, manageable chunks');
      recommendations.push('Use the Eisenhower Matrix for prioritization');
      recommendations.push('Review and adjust task estimates regularly');
    }
    
    // Responsiveness recommendations
    if (metrics.responsiveness < 60) {
      recommendations.push('Set specific times for checking messages');
      recommendations.push('Use quick replies for acknowledgment');
      recommendations.push('Delegate or redirect non-critical requests');
    }
    
    // Work-life balance recommendations
    if (metrics.workLifeBalance < 60) {
      recommendations.push('Set firm boundaries for work hours');
      recommendations.push('Schedule regular breaks and exercise');
      recommendations.push('Practice digital detox after work hours');
    }
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  private async calculateTrends(userId: string): Promise<any> {
    // Calculate productivity trends over different periods
    // Simplified implementation with mock data
    return {
      daily: [75, 82, 78, 85, 88, 92, 87],
      weekly: [80, 82, 85, 83],
      monthly: [78, 80, 82, 85]
    };
  }

  private async calculateComparisons(userId: string, currentScore: number): Promise<any> {
    // Compare with historical data and team average
    return {
      vsYesterday: currentScore - 82,
      vsLastWeek: currentScore - 80,
      vsTeamAverage: currentScore - 75
    };
  }

  // Pattern detection
  public async detectProductivityPatterns(userId: string): Promise<ProductivityPattern[]> {
    const sessions = this.sessions.get(userId) || [];
    const patterns: ProductivityPattern[] = [];
    
    // Analyze peak productivity times
    const hourlyProductivity = new Map<number, number[]>();
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (!hourlyProductivity.has(hour)) {
        hourlyProductivity.set(hour, []);
      }
      hourlyProductivity.get(hour)!.push(session.productivity);
    });
    
    // Find peak hours
    let peakHour = -1;
    let peakProductivity = 0;
    hourlyProductivity.forEach((productivityScores, hour) => {
      const avg = productivityScores.reduce((a, b) => a + b, 0) / productivityScores.length;
      if (avg > peakProductivity) {
        peakProductivity = avg;
        peakHour = hour;
      }
    });
    
    if (peakHour >= 0) {
      patterns.push({
        type: 'peak',
        timeOfDay: `${peakHour}:00-${peakHour + 1}:00`,
        description: `Your peak productivity is typically around ${peakHour}:00`,
        recommendation: `Schedule important tasks during ${peakHour}:00-${peakHour + 2}:00`
      });
    }
    
    // Detect consistency patterns
    const dailyScores = sessions.reduce((acc, session) => {
      const day = session.startTime.toDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(session.productivity);
      return acc;
    }, {} as Record<string, number[]>);
    
    const variance = this.calculateVariance(Object.values(dailyScores).flat());
    if (variance < 10) {
      patterns.push({
        type: 'consistent',
        timeOfDay: 'all day',
        description: 'You maintain consistent productivity throughout the day',
        recommendation: 'Your steady approach is working well - maintain your routine'
      });
    } else if (variance > 30) {
      patterns.push({
        type: 'erratic',
        timeOfDay: 'varies',
        description: 'Your productivity levels fluctuate significantly',
        recommendation: 'Try to establish more consistent work routines and habits'
      });
    }
    
    return patterns;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // Real-time tracking
  public async startSession(userId: string, type: WorkSession['type']): Promise<string> {
    const sessionId = `session_${Date.now()}`;
    const session: WorkSession = {
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      type,
      productivity: 0,
      distractions: 0
    };
    
    // Store active session
    await AsyncStorage.setItem(`active_session_${userId}`, JSON.stringify({
      sessionId,
      session
    }));
    
    return sessionId;
  }

  public async endSession(userId: string, sessionId: string, productivity: number): Promise<void> {
    const activeSession = await AsyncStorage.getItem(`active_session_${userId}`);
    if (!activeSession) return;
    
    const {session} = JSON.parse(activeSession);
    session.endTime = new Date();
    session.duration = (session.endTime.getTime() - new Date(session.startTime).getTime()) / 60000; // minutes
    session.productivity = productivity;
    
    // Add to user sessions
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, []);
    }
    this.sessions.get(userId)!.push(session);
    
    // Clean up active session
    await AsyncStorage.removeItem(`active_session_${userId}`);
    
    // Save to persistent storage
    await this.saveData();
  }

  private async saveData(): Promise<void> {
    const data = {
      sessions: Object.fromEntries(this.sessions),
      patterns: Object.fromEntries(this.patterns),
      metrics: Object.fromEntries(this.metrics)
    };
    
    await AsyncStorage.setItem('productivity_data', JSON.stringify(data));
  }

  private getDefaultScore(): ProductivityScore {
    return {
      score: 0,
      insights: ['Unable to calculate productivity score'],
      recommendations: [],
      breakdown: {
        focusTime: 0,
        collaborationScore: 0,
        taskCompletion: 0,
        responsiveness: 0,
        workLifeBalance: 0
      },
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      },
      comparisons: {
        vsYesterday: 0,
        vsLastWeek: 0,
        vsTeamAverage: 0
      }
    };
  }
}
