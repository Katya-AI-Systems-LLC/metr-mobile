// TimeTracker.ts - Automatic Time Tracking with AI for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, AppStateStatus} from 'react-native';

interface TimeEntry {
  id: string;
  taskId?: string;
  projectId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activity: string;
  category: 'focus' | 'meeting' | 'break' | 'communication' | 'development' | 'review';
  productivity: number; // 0-100
  isAutoTracked: boolean;
  tags: string[];
  applications?: string[];
  keystrokes?: number;
  mouseActivity?: number;
}

interface TimeReport {
  totalHours: number;
  focusHours: number;
  meetingHours: number;
  breakHours: number;
  productiveHours: number;
  topActivities: Array<{activity: string; hours: number}>;
  peakProductivityHour: number;
  averageSessionLength: number;
  distractionCount: number;
}

interface ProductivityPattern {
  dayOfWeek: number;
  hour: number;
  productivityScore: number;
  activityType: string;
}

export class TimeTracker {
  private static instance: TimeTracker;
  private currentEntry: TimeEntry | null = null;
  private entries: Map<string, TimeEntry>;
  private isTracking: boolean = false;
  private lastActivity: Date;
  private idleThreshold: number = 300000; // 5 minutes
  private productivityPatterns: ProductivityPattern[] = [];
  private appStateSubscription: any;
  
  private constructor() {
    this.entries = new Map();
    this.lastActivity = new Date();
    this.initialize();
  }

  public static getInstance(): TimeTracker {
    if (!TimeTracker.instance) {
      TimeTracker.instance = new TimeTracker();
    }
    return TimeTracker.instance;
  }

  private async initialize() {
    await this.loadEntries();
    this.setupActivityMonitoring();
    this.startAutoTracking();
    this.analyzeProductivityPatterns();
  }

  private async loadEntries() {
    try {
      const saved = await AsyncStorage.getItem('time_entries');
      if (saved) {
        const entries = JSON.parse(saved);
        entries.forEach((entry: TimeEntry) => {
          this.entries.set(entry.id, entry);
        });
      }
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  }

  private setupActivityMonitoring() {
    // Monitor app state changes
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );

    // Monitor user activity (simplified - in production, use native modules)
    setInterval(() => {
      this.checkIdleStatus();
    }, 60000); // Check every minute
  }

  private handleAppStateChange(nextAppState: AppStateStatus) {
    if (nextAppState === 'active') {
      this.resumeTracking();
    } else if (nextAppState === 'background') {
      this.pauseTracking();
    }
  }

  private checkIdleStatus() {
    const now = new Date();
    const idleTime = now.getTime() - this.lastActivity.getTime();
    
    if (idleTime > this.idleThreshold && this.isTracking) {
      this.pauseTracking();
      this.startBreakTime();
    }
  }

  // Start tracking time
  public startTracking(
    activity: string,
    category?: TimeEntry['category'],
    taskId?: string,
    projectId?: string
  ): TimeEntry {
    // End current tracking if exists
    if (this.currentEntry) {
      this.stopTracking();
    }

    const entry: TimeEntry = {
      id: `time_${Date.now()}`,
      taskId,
      projectId,
      startTime: new Date(),
      activity,
      category: category || this.categorizeActivity(activity),
      productivity: 0,
      isAutoTracked: false,
      tags: this.extractTags(activity),
    };

    this.currentEntry = entry;
    this.isTracking = true;
    this.lastActivity = new Date();

    console.log(`Started tracking: ${activity}`);
    return entry;
  }

  // Stop tracking
  public stopTracking(): TimeEntry | null {
    if (!this.currentEntry) return null;

    this.currentEntry.endTime = new Date();
    this.currentEntry.duration = 
      this.currentEntry.endTime.getTime() - this.currentEntry.startTime.getTime();
    
    // Calculate productivity score
    this.currentEntry.productivity = this.calculateProductivity(this.currentEntry);

    // Save entry
    this.entries.set(this.currentEntry.id, this.currentEntry);
    this.saveEntries();

    const completed = this.currentEntry;
    this.currentEntry = null;
    this.isTracking = false;

    console.log(`Stopped tracking: ${completed.activity} (${completed.duration}ms)`);
    return completed;
  }

  // Pause tracking (e.g., when app goes to background)
  private pauseTracking() {
    if (this.currentEntry && this.isTracking) {
      this.isTracking = false;
      // Save partial entry
      const pausedEntry = {...this.currentEntry};
      pausedEntry.endTime = new Date();
      pausedEntry.duration = 
        pausedEntry.endTime.getTime() - pausedEntry.startTime.getTime();
      this.entries.set(pausedEntry.id + '_partial', pausedEntry);
    }
  }

  // Resume tracking
  private resumeTracking() {
    if (this.currentEntry && !this.isTracking) {
      this.isTracking = true;
      this.lastActivity = new Date();
      // Create continuation entry
      this.currentEntry.startTime = new Date();
    }
  }

  // Auto-tracking based on activity detection
  private startAutoTracking() {
    // In production, this would integrate with native modules to detect:
    // - Active application
    // - Keyboard/mouse activity
    // - Screen content analysis
    
    setInterval(() => {
      if (!this.currentEntry) {
        this.detectAndTrackActivity();
      }
    }, 300000); // Every 5 minutes
  }

  private async detectAndTrackActivity() {
    // AI-powered activity detection
    // In production, would analyze screen content, active apps, etc.
    const detectedActivity = await this.analyzeCurrentActivity();
    
    if (detectedActivity && detectedActivity.confidence > 0.7) {
      const entry: TimeEntry = {
        id: `auto_${Date.now()}`,
        startTime: new Date(),
        activity: detectedActivity.activity,
        category: detectedActivity.category,
        productivity: 0,
        isAutoTracked: true,
        tags: detectedActivity.tags,
        applications: detectedActivity.applications,
      };

      this.currentEntry = entry;
      this.isTracking = true;
    }
  }

  private async analyzeCurrentActivity(): Promise<{
    activity: string;
    category: TimeEntry['category'];
    confidence: number;
    tags: string[];
    applications: string[];
  } | null> {
    // Simulate AI activity detection
    // In production, would use computer vision and app usage analysis
    return {
      activity: 'Development Work',
      category: 'development',
      confidence: 0.85,
      tags: ['coding', 'react-native'],
      applications: ['VSCode', 'Chrome'],
    };
  }

  // Start break time tracking
  private startBreakTime() {
    this.startTracking('Break', 'break');
  }

  // Categorize activity using AI
  private categorizeActivity(activity: string): TimeEntry['category'] {
    const activityLower = activity.toLowerCase();
    
    if (activityLower.includes('meeting') || activityLower.includes('call')) {
      return 'meeting';
    }
    if (activityLower.includes('break') || activityLower.includes('lunch')) {
      return 'break';
    }
    if (activityLower.includes('review') || activityLower.includes('pr')) {
      return 'review';
    }
    if (activityLower.includes('chat') || activityLower.includes('slack')) {
      return 'communication';
    }
    if (activityLower.includes('code') || activityLower.includes('develop')) {
      return 'development';
    }
    
    return 'focus';
  }

  // Extract tags from activity description
  private extractTags(activity: string): string[] {
    const tags: string[] = [];
    
    // Extract hashtags
    const hashtags = activity.match(/#\w+/g) || [];
    tags.push(...hashtags.map(h => h.substring(1)));
    
    // Extract project names (simplified)
    const projects = activity.match(/\[([^\]]+)\]/g) || [];
    tags.push(...projects.map(p => p.slice(1, -1)));
    
    // Add contextual tags
    if (activity.toLowerCase().includes('bug')) tags.push('bugfix');
    if (activity.toLowerCase().includes('feature')) tags.push('feature');
    if (activity.toLowerCase().includes('urgent')) tags.push('urgent');
    
    return tags;
  }

  // Calculate productivity score
  private calculateProductivity(entry: TimeEntry): number {
    let score = 50; // Base score
    
    // Factor in time of day (peak hours)
    const hour = entry.startTime.getHours();
    if (hour >= 9 && hour <= 11) score += 20; // Morning peak
    if (hour >= 14 && hour <= 16) score += 15; // Afternoon peak
    
    // Factor in duration (optimal session length)
    const durationMinutes = (entry.duration || 0) / 60000;
    if (durationMinutes >= 25 && durationMinutes <= 90) score += 20; // Optimal focus time
    if (durationMinutes > 180) score -= 10; // Too long without break
    
    // Factor in category
    if (entry.category === 'focus' || entry.category === 'development') score += 15;
    if (entry.category === 'break') score = 30; // Breaks are necessary but not "productive"
    
    // Factor in day patterns
    const dayOfWeek = entry.startTime.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 4) score += 5; // Mon-Thu typically more productive
    
    return Math.max(0, Math.min(100, score));
  }

  // Generate time report
  public async generateReport(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<TimeReport> {
    const relevantEntries = Array.from(this.entries.values()).filter(entry => {
      const entryTime = entry.startTime.getTime();
      return entryTime >= startDate.getTime() && entryTime <= endDate.getTime();
    });

    const totalMs = relevantEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalHours = totalMs / 3600000;

    const byCategory = this.groupByCategory(relevantEntries);
    const byActivity = this.groupByActivity(relevantEntries);

    const productiveEntries = relevantEntries.filter(e => e.productivity > 70);
    const productiveHours = productiveEntries.reduce((sum, e) => 
      sum + (e.duration || 0), 0) / 3600000;

    const peakHour = this.findPeakProductivityHour(relevantEntries);
    const avgSession = totalMs / relevantEntries.length / 60000; // in minutes

    // Count distractions (short sessions < 10 minutes)
    const distractions = relevantEntries.filter(e => 
      (e.duration || 0) < 600000).length;

    return {
      totalHours,
      focusHours: (byCategory.get('focus') || 0) / 3600000,
      meetingHours: (byCategory.get('meeting') || 0) / 3600000,
      breakHours: (byCategory.get('break') || 0) / 3600000,
      productiveHours,
      topActivities: Array.from(byActivity.entries())
        .map(([activity, ms]) => ({activity, hours: ms / 3600000}))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5),
      peakProductivityHour: peakHour,
      averageSessionLength: avgSession,
      distractionCount: distractions,
    };
  }

  private groupByCategory(entries: TimeEntry[]): Map<string, number> {
    const grouped = new Map<string, number>();
    
    entries.forEach(entry => {
      const current = grouped.get(entry.category) || 0;
      grouped.set(entry.category, current + (entry.duration || 0));
    });
    
    return grouped;
  }

  private groupByActivity(entries: TimeEntry[]): Map<string, number> {
    const grouped = new Map<string, number>();
    
    entries.forEach(entry => {
      const current = grouped.get(entry.activity) || 0;
      grouped.set(entry.activity, current + (entry.duration || 0));
    });
    
    return grouped;
  }

  private findPeakProductivityHour(entries: TimeEntry[]): number {
    const hourlyProductivity = new Map<number, number[]>();
    
    entries.forEach(entry => {
      const hour = entry.startTime.getHours();
      const scores = hourlyProductivity.get(hour) || [];
      scores.push(entry.productivity);
      hourlyProductivity.set(hour, scores);
    });
    
    let peakHour = 10; // Default
    let peakScore = 0;
    
    hourlyProductivity.forEach((scores, hour) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avgScore > peakScore) {
        peakScore = avgScore;
        peakHour = hour;
      }
    });
    
    return peakHour;
  }

  // Analyze productivity patterns
  private async analyzeProductivityPatterns() {
    const entries = Array.from(this.entries.values());
    
    // Group by day and hour
    const patterns = new Map<string, ProductivityPattern>();
    
    entries.forEach(entry => {
      const day = entry.startTime.getDay();
      const hour = entry.startTime.getHours();
      const key = `${day}-${hour}`;
      
      const existing = patterns.get(key);
      if (existing) {
        // Average the productivity scores
        existing.productivityScore = 
          (existing.productivityScore + entry.productivity) / 2;
      } else {
        patterns.set(key, {
          dayOfWeek: day,
          hour,
          productivityScore: entry.productivity,
          activityType: entry.category,
        });
      }
    });
    
    this.productivityPatterns = Array.from(patterns.values());
  }

  // Get productivity insights
  public getProductivityInsights(): {
    bestTimeToWork: string;
    worstTimeToWork: string;
    optimalSessionLength: number;
    recommendations: string[];
  } {
    const patterns = this.productivityPatterns.sort((a, b) => 
      b.productivityScore - a.productivityScore);
    
    const best = patterns[0];
    const worst = patterns[patterns.length - 1];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const recommendations = [];
    
    // Generate personalized recommendations
    if (best && best.hour < 12) {
      recommendations.push('You work best in the morning. Schedule important tasks then.');
    } else if (best && best.hour > 16) {
      recommendations.push('You\'re an evening person. Save complex work for later.');
    }
    
    const avgSessionLength = Array.from(this.entries.values())
      .map(e => e.duration || 0)
      .reduce((a, b, i, arr) => a + b / arr.length, 0) / 60000;
    
    if (avgSessionLength < 25) {
      recommendations.push('Try longer focus sessions (25-90 minutes) for deep work.');
    }
    
    if (avgSessionLength > 120) {
      recommendations.push('Take more breaks to maintain productivity.');
    }
    
    return {
      bestTimeToWork: best ? `${days[best.dayOfWeek]} at ${best.hour}:00` : 'Not enough data',
      worstTimeToWork: worst ? `${days[worst.dayOfWeek]} at ${worst.hour}:00` : 'Not enough data',
      optimalSessionLength: Math.round(avgSessionLength),
      recommendations,
    };
  }

  // Save entries
  private async saveEntries() {
    try {
      const entries = Array.from(this.entries.values());
      await AsyncStorage.setItem('time_entries', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save time entries:', error);
    }
  }

  // Get current tracking status
  public getCurrentEntry(): TimeEntry | null {
    return this.currentEntry;
  }

  public isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Update activity timestamp (for idle detection)
  public updateActivity() {
    this.lastActivity = new Date();
  }

  // Get entries for date range
  public getEntries(startDate?: Date, endDate?: Date): TimeEntry[] {
    let entries = Array.from(this.entries.values());
    
    if (startDate) {
      entries = entries.filter(e => e.startTime >= startDate);
    }
    
    if (endDate) {
      entries = entries.filter(e => e.startTime <= endDate);
    }
    
    return entries.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
}
