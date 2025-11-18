// GoalsOKR.ts - Goals and OKRs Management System for METR
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Objective {
  id: string;
  title: string;
  description: string;
  owner: string;
  team?: string;
  quarter: string;
  year: number;
  category: 'company' | 'team' | 'personal';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  keyResults: KeyResult[];
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  tags: string[];
  alignment?: string; // Parent objective ID
}

interface KeyResult {
  id: string;
  title: string;
  description?: string;
  metric: string;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  owner: string;
  status: 'not_started' | 'on_track' | 'at_risk' | 'completed' | 'missed';
  progress: number; // 0-100
  checkIns: CheckIn[];
  initiatives: Initiative[];
  confidence: number; // 0-1, confidence in achieving
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
}

interface CheckIn {
  id: string;
  date: Date;
  value: number;
  comment: string;
  author: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  blockers?: string[];
}

interface Initiative {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  completedAt?: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'smart' | 'stretch' | 'learning' | 'habit';
  category: 'career' | 'skill' | 'project' | 'personal' | 'team';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  measurementType: 'binary' | 'numeric' | 'percentage' | 'milestone';
  targetValue?: any;
  currentValue?: any;
  milestones: Milestone[];
  habits?: Habit[];
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'abandoned';
  priority: 'low' | 'medium' | 'high' | 'critical';
  motivation: string;
  rewards: string[];
  accountability?: {
    partner?: string;
    checkInFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    lastCheckIn?: Date;
  };
  createdAt: Date;
  targetDate: Date;
}

interface Milestone {
  id: string;
  title: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
  blockers?: string[];
}

interface Habit {
  id: string;
  action: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  bestStreak: number;
  lastCompleted?: Date;
  reminderTime?: string;
}

export class GoalsOKR {
  private static instance: GoalsOKR;
  private objectives: Map<string, Objective>;
  private goals: Map<string, Goal>;
  private activeQuarter: string;
  private userId: string;
  
  private constructor() {
    this.objectives = new Map();
    this.goals = new Map();
    this.activeQuarter = this.getCurrentQuarter();
    this.userId = 'current_user'; // Would be set from auth
    this.initialize();
  }

  public static getInstance(): GoalsOKR {
    if (!GoalsOKR.instance) {
      GoalsOKR.instance = new GoalsOKR();
    }
    return GoalsOKR.instance;
  }

  private async initialize() {
    await this.loadObjectives();
    await this.loadGoals();
    this.startProgressTracking();
  }

  private getCurrentQuarter(): string {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return `Q${quarter} ${now.getFullYear()}`;
  }

  private async loadObjectives() {
    try {
      const saved = await AsyncStorage.getItem('okr_objectives');
      if (saved) {
        const objectives = JSON.parse(saved);
        objectives.forEach((obj: Objective) => {
          this.objectives.set(obj.id, obj);
        });
      }
    } catch (error) {
      console.error('Failed to load objectives:', error);
    }
  }

  private async loadGoals() {
    try {
      const saved = await AsyncStorage.getItem('goals');
      if (saved) {
        const goals = JSON.parse(saved);
        goals.forEach((goal: Goal) => {
          this.goals.set(goal.id, goal);
        });
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  }

  // Create new objective
  public async createObjective(
    title: string,
    description: string,
    category: Objective['category'],
    dueDate: Date,
    team?: string
  ): Promise<Objective> {
    const objective: Objective = {
      id: `obj_${Date.now()}`,
      title,
      description,
      owner: this.userId,
      team,
      quarter: this.activeQuarter,
      year: new Date().getFullYear(),
      category,
      status: 'draft',
      progress: 0,
      keyResults: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate,
      tags: this.extractTags(title + ' ' + description),
    };

    this.objectives.set(objective.id, objective);
    await this.saveObjectives();
    
    return objective;
  }

  // Add key result to objective
  public async addKeyResult(
    objectiveId: string,
    title: string,
    metric: string,
    startValue: number,
    targetValue: number,
    unit: string,
    dueDate: Date
  ): Promise<KeyResult> {
    const objective = this.objectives.get(objectiveId);
    if (!objective) throw new Error('Objective not found');

    const keyResult: KeyResult = {
      id: `kr_${Date.now()}`,
      title,
      metric,
      startValue,
      targetValue,
      currentValue: startValue,
      unit,
      owner: this.userId,
      status: 'not_started',
      progress: 0,
      checkIns: [],
      initiatives: [],
      confidence: 0.7, // Default confidence
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate,
    };

    objective.keyResults.push(keyResult);
    objective.updatedAt = new Date();
    
    // Update objective progress
    this.updateObjectiveProgress(objective);
    
    await this.saveObjectives();
    return keyResult;
  }

  // Check in on key result
  public async checkInKeyResult(
    objectiveId: string,
    keyResultId: string,
    value: number,
    comment: string,
    sentiment: CheckIn['sentiment'],
    blockers?: string[]
  ): Promise<void> {
    const objective = this.objectives.get(objectiveId);
    if (!objective) throw new Error('Objective not found');

    const keyResult = objective.keyResults.find(kr => kr.id === keyResultId);
    if (!keyResult) throw new Error('Key result not found');

    const checkIn: CheckIn = {
      id: `ci_${Date.now()}`,
      date: new Date(),
      value,
      comment,
      author: this.userId,
      sentiment,
      blockers,
    };

    keyResult.checkIns.push(checkIn);
    keyResult.currentValue = value;
    keyResult.updatedAt = new Date();
    
    // Calculate progress
    const range = keyResult.targetValue - keyResult.startValue;
    const progress = ((value - keyResult.startValue) / range) * 100;
    keyResult.progress = Math.max(0, Math.min(100, progress));
    
    // Update status based on progress and timeline
    keyResult.status = this.calculateKeyResultStatus(keyResult);
    
    // Update confidence based on trend
    keyResult.confidence = this.calculateConfidence(keyResult);
    
    // Update objective
    this.updateObjectiveProgress(objective);
    
    await this.saveObjectives();
  }

  private calculateKeyResultStatus(keyResult: KeyResult): KeyResult['status'] {
    const now = new Date();
    const timeProgress = (now.getTime() - keyResult.createdAt.getTime()) / 
                        (keyResult.dueDate.getTime() - keyResult.createdAt.getTime());
    
    if (keyResult.progress >= 100) return 'completed';
    if (keyResult.progress < timeProgress * 100 - 20) return 'at_risk';
    if (keyResult.progress >= timeProgress * 100 - 10) return 'on_track';
    return 'not_started';
  }

  private calculateConfidence(keyResult: KeyResult): number {
    if (keyResult.checkIns.length < 2) return keyResult.confidence;
    
    // Analyze trend from last 3 check-ins
    const recentCheckIns = keyResult.checkIns.slice(-3);
    const trend = this.calculateTrend(recentCheckIns.map(ci => ci.value));
    
    // Adjust confidence based on trend and sentiment
    let confidence = keyResult.confidence;
    
    if (trend > 0) confidence += 0.1;
    else if (trend < 0) confidence -= 0.1;
    
    const lastCheckIn = recentCheckIns[recentCheckIns.length - 1];
    if (lastCheckIn.sentiment === 'positive') confidence += 0.05;
    else if (lastCheckIn.sentiment === 'negative') confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      trend += values[i] - values[i - 1];
    }
    return trend / (values.length - 1);
  }

  private updateObjectiveProgress(objective: Objective) {
    if (objective.keyResults.length === 0) {
      objective.progress = 0;
      return;
    }
    
    const totalProgress = objective.keyResults.reduce((sum, kr) => sum + kr.progress, 0);
    objective.progress = totalProgress / objective.keyResults.length;
    
    // Update status
    if (objective.progress >= 100) {
      objective.status = 'completed';
    } else if (objective.progress > 0) {
      objective.status = 'active';
    }
    
    objective.updatedAt = new Date();
  }

  // Create goal
  public async createGoal(
    title: string,
    description: string,
    type: Goal['type'],
    category: Goal['category'],
    timeframe: Goal['timeframe'],
    targetDate: Date,
    measurementType: Goal['measurementType'],
    targetValue?: any
  ): Promise<Goal> {
    const goal: Goal = {
      id: `goal_${Date.now()}`,
      title,
      description,
      type,
      category,
      timeframe,
      measurementType,
      targetValue,
      currentValue: measurementType === 'percentage' ? 0 : undefined,
      milestones: [],
      progress: 0,
      status: 'not_started',
      priority: 'medium',
      motivation: '',
      rewards: [],
      createdAt: new Date(),
      targetDate,
    };

    this.goals.set(goal.id, goal);
    await this.saveGoals();
    
    return goal;
  }

  // Add milestone to goal
  public async addMilestone(
    goalId: string,
    title: string,
    targetDate: Date
  ): Promise<Milestone> {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error('Goal not found');

    const milestone: Milestone = {
      id: `ms_${Date.now()}`,
      title,
      targetDate,
      completed: false,
    };

    goal.milestones.push(milestone);
    this.updateGoalProgress(goal);
    
    await this.saveGoals();
    return milestone;
  }

  // Complete milestone
  public async completeMilestone(
    goalId: string,
    milestoneId: string
  ): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error('Goal not found');

    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    milestone.completed = true;
    milestone.completedAt = new Date();
    
    this.updateGoalProgress(goal);
    await this.saveGoals();
  }

  private updateGoalProgress(goal: Goal) {
    if (goal.measurementType === 'milestone') {
      const completed = goal.milestones.filter(m => m.completed).length;
      const total = goal.milestones.length;
      goal.progress = total > 0 ? (completed / total) * 100 : 0;
    } else if (goal.measurementType === 'percentage') {
      goal.progress = goal.currentValue || 0;
    } else if (goal.measurementType === 'numeric' && goal.targetValue) {
      goal.progress = ((goal.currentValue || 0) / goal.targetValue) * 100;
    } else if (goal.measurementType === 'binary') {
      goal.progress = goal.currentValue ? 100 : 0;
    }
    
    // Update status
    if (goal.progress >= 100) {
      goal.status = 'completed';
    } else if (goal.progress > 0) {
      goal.status = 'in_progress';
    }
  }

  // Add habit to goal
  public async addHabit(
    goalId: string,
    action: string,
    frequency: Habit['frequency']
  ): Promise<Habit> {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error('Goal not found');

    const habit: Habit = {
      id: `habit_${Date.now()}`,
      action,
      frequency,
      streak: 0,
      bestStreak: 0,
    };

    if (!goal.habits) goal.habits = [];
    goal.habits.push(habit);
    
    await this.saveGoals();
    return habit;
  }

  // Check in habit
  public async checkInHabit(goalId: string, habitId: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal || !goal.habits) throw new Error('Goal or habits not found');

    const habit = goal.habits.find(h => h.id === habitId);
    if (!habit) throw new Error('Habit not found');

    const now = new Date();
    
    // Check if already completed today
    if (habit.lastCompleted) {
      const lastDate = new Date(habit.lastCompleted);
      if (lastDate.toDateString() === now.toDateString()) {
        throw new Error('Habit already completed today');
      }
      
      // Check streak
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince === 1) {
        habit.streak++;
      } else {
        habit.streak = 1;
      }
    } else {
      habit.streak = 1;
    }
    
    habit.lastCompleted = now;
    habit.bestStreak = Math.max(habit.bestStreak, habit.streak);
    
    await this.saveGoals();
  }

  // Get OKR dashboard data
  public async getOKRDashboard(quarter?: string): Promise<{
    objectives: Objective[];
    overallProgress: number;
    atRiskCount: number;
    completedCount: number;
    topPerformers: Array<{name: string; progress: number}>;
    insights: string[];
  }> {
    const targetQuarter = quarter || this.activeQuarter;
    const objectives = Array.from(this.objectives.values())
      .filter(obj => `${obj.quarter} ${obj.year}` === targetQuarter);
    
    const overallProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0) / 
                           (objectives.length || 1);
    
    const atRiskCount = objectives.reduce((count, obj) => {
      const atRiskKRs = obj.keyResults.filter(kr => kr.status === 'at_risk').length;
      return count + (atRiskKRs > 0 ? 1 : 0);
    }, 0);
    
    const completedCount = objectives.filter(obj => obj.status === 'completed').length;
    
    // Get top performers (simplified)
    const topPerformers = objectives
      .filter(obj => obj.category === 'personal')
      .map(obj => ({name: obj.owner, progress: obj.progress}))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
    
    const insights = this.generateOKRInsights(objectives);
    
    return {
      objectives,
      overallProgress,
      atRiskCount,
      completedCount,
      topPerformers,
      insights,
    };
  }

  private generateOKRInsights(objectives: Objective[]): string[] {
    const insights: string[] = [];
    
    const avgProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0) / 
                       (objectives.length || 1);
    
    if (avgProgress < 40) {
      insights.push('📊 Overall progress is below 40%. Consider reviewing targets or allocating more resources.');
    } else if (avgProgress > 70) {
      insights.push('🚀 Great progress! Team is on track to meet quarterly objectives.');
    }
    
    const atRiskCount = objectives.filter(obj => 
      obj.keyResults.some(kr => kr.status === 'at_risk')).length;
    
    if (atRiskCount > objectives.length * 0.3) {
      insights.push('⚠️ Over 30% of objectives have at-risk key results. Schedule review sessions.');
    }
    
    // Check confidence levels
    const lowConfidenceKRs = objectives.flatMap(obj => 
      obj.keyResults.filter(kr => kr.confidence < 0.5));
    
    if (lowConfidenceKRs.length > 0) {
      insights.push(`🎯 ${lowConfidenceKRs.length} key results have low confidence. Consider adjusting targets or strategies.`);
    }
    
    return insights;
  }

  // Get goal recommendations using AI
  public async getGoalRecommendations(userId: string): Promise<string[]> {
    const userGoals = Array.from(this.goals.values())
      .filter(g => g.status === 'in_progress');
    
    const recommendations: string[] = [];
    
    // Analyze current goals
    const categories = new Set(userGoals.map(g => g.category));
    
    if (!categories.has('skill')) {
      recommendations.push('Consider adding skill development goals for continuous learning');
    }
    
    if (!categories.has('career')) {
      recommendations.push('Set career advancement goals to guide professional growth');
    }
    
    // Check for balanced timeframes
    const timeframes = userGoals.map(g => g.timeframe);
    if (!timeframes.includes('daily')) {
      recommendations.push('Add daily habits to build consistency');
    }
    
    if (!timeframes.includes('yearly')) {
      recommendations.push('Define long-term yearly goals for strategic direction');
    }
    
    // Check goal completion rate
    const completedGoals = Array.from(this.goals.values())
      .filter(g => g.status === 'completed');
    const completionRate = completedGoals.length / this.goals.size;
    
    if (completionRate < 0.3) {
      recommendations.push('Focus on completing existing goals before adding new ones');
    }
    
    return recommendations;
  }

  private extractTags(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const tags: string[] = [];
    
    // Extract key terms
    const keyTerms = ['growth', 'revenue', 'customer', 'product', 'team', 
                      'quality', 'performance', 'innovation', 'efficiency'];
    
    words.forEach(word => {
      if (keyTerms.some(term => word.includes(term))) {
        tags.push(word);
      }
    });
    
    return [...new Set(tags)];
  }

  private async saveObjectives() {
    try {
      const objectives = Array.from(this.objectives.values());
      await AsyncStorage.setItem('okr_objectives', JSON.stringify(objectives));
    } catch (error) {
      console.error('Failed to save objectives:', error);
    }
  }

  private async saveGoals() {
    try {
      const goals = Array.from(this.goals.values());
      await AsyncStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  }

  private startProgressTracking() {
    // Check for goal and OKR updates periodically
    setInterval(() => {
      this.checkDeadlines();
      this.sendReminders();
    }, 86400000); // Daily
  }

  private checkDeadlines() {
    const now = new Date();
    const warningThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Check objectives
    this.objectives.forEach(obj => {
      const timeLeft = obj.dueDate.getTime() - now.getTime();
      if (timeLeft < warningThreshold && obj.status !== 'completed') {
        console.log(`Objective "${obj.title}" is due soon`);
        // Send notification
      }
    });
    
    // Check goals
    this.goals.forEach(goal => {
      const timeLeft = goal.targetDate.getTime() - now.getTime();
      if (timeLeft < warningThreshold && goal.status !== 'completed') {
        console.log(`Goal "${goal.title}" is due soon`);
        // Send notification
      }
    });
  }

  private sendReminders() {
    // Send check-in reminders
    this.goals.forEach(goal => {
      if (goal.accountability && goal.accountability.lastCheckIn) {
        const daysSinceCheckIn = Math.floor(
          (Date.now() - goal.accountability.lastCheckIn.getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        
        const frequencyDays = {
          daily: 1,
          weekly: 7,
          biweekly: 14,
          monthly: 30,
        };
        
        if (daysSinceCheckIn >= frequencyDays[goal.accountability.checkInFrequency]) {
          console.log(`Time for accountability check-in on "${goal.title}"`);
          // Send notification
        }
      }
    });
  }

  // Get methods
  public getObjectives(quarter?: string): Objective[] {
    const targetQuarter = quarter || this.activeQuarter;
    return Array.from(this.objectives.values())
      .filter(obj => `${obj.quarter} ${obj.year}` === targetQuarter);
  }

  public getGoals(status?: Goal['status']): Goal[] {
    let goals = Array.from(this.goals.values());
    if (status) {
      goals = goals.filter(g => g.status === status);
    }
    return goals;
  }
}
