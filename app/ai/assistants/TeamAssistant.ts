// TeamAssistant.ts - Team AI Manager for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AIConfig} from '../core/AIManager';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: 'available' | 'busy' | 'away' | 'offline';
  workload: number; // 0-100
  mood?: 'happy' | 'neutral' | 'stressed' | 'frustrated';
  productivity: number; // 0-100
}

export interface TeamMetrics {
  teamId: string;
  healthScore: number;
  productivityScore: number;
  collaborationScore: number;
  moodScore: number;
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface Meeting {
  id: string;
  title: string;
  participants: string[];
  scheduledTime: Date;
  duration: number;
  type: 'standup' | 'planning' | 'review' | 'brainstorm' | 'one-on-one';
  aiSuggestions?: string[];
  autoTranscribe: boolean;
}

export interface TeamInsight {
  type: 'performance' | 'collaboration' | 'wellbeing' | 'productivity';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionItems: string[];
  affectedMembers?: string[];
}

export class TeamAssistant {
  private config: AIConfig;
  private teamMembers: Map<string, TeamMember>;
  private teamMetrics: TeamMetrics | null = null;
  private insights: TeamInsight[] = [];
  private meetings: Map<string, Meeting>;

  constructor(config: AIConfig) {
    this.config = config;
    this.teamMembers = new Map();
    this.meetings = new Map();
    this.initialize();
  }

  private async initialize() {
    await this.loadTeamData();
    await this.calculateMetrics();
    this.startMonitoring();
  }

  private async loadTeamData() {
    try {
      const teamData = await AsyncStorage.getItem('team_data');
      if (teamData) {
        const parsed = JSON.parse(teamData);
        parsed.members?.forEach((member: TeamMember) => {
          this.teamMembers.set(member.id, member);
        });
      }
    } catch (error) {
      console.error('Failed to load team data:', error);
    }
  }

  // Team analysis
  public async analyzeTeam(teamId: string): Promise<TeamMetrics> {
    try {
      const metrics = await this.calculateMetrics();
      const insights = await this.generateInsights();
      
      this.teamMetrics = {
        teamId,
        healthScore: this.calculateHealthScore(),
        productivityScore: this.calculateProductivityScore(),
        collaborationScore: this.calculateCollaborationScore(),
        moodScore: this.calculateMoodScore(),
        velocityTrend: this.analyzeVelocityTrend(),
        burnoutRisk: this.assessBurnoutRisk(),
        recommendations: this.generateRecommendations(insights),
      };

      return this.teamMetrics;
    } catch (error) {
      console.error('Failed to analyze team:', error);
      throw error;
    }
  }

  private calculateHealthScore(): number {
    let score = 100;
    
    this.teamMembers.forEach(member => {
      // Deduct points for high workload
      if (member.workload > 80) score -= 10;
      if (member.workload > 90) score -= 15;
      
      // Deduct for stressed members
      if (member.mood === 'stressed') score -= 15;
      if (member.mood === 'frustrated') score -= 20;
      
      // Deduct for unavailable members
      if (member.availability === 'offline') score -= 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  private calculateProductivityScore(): number {
    const members = Array.from(this.teamMembers.values());
    if (members.length === 0) return 0;
    
    const totalProductivity = members.reduce((sum, member) => sum + member.productivity, 0);
    return Math.round(totalProductivity / members.length);
  }

  private calculateCollaborationScore(): number {
    // This would analyze communication patterns, meeting effectiveness, etc.
    // Simplified implementation
    const baseScore = 75;
    const activeMembersBonus = Array.from(this.teamMembers.values())
      .filter(m => m.availability === 'available').length * 5;
    
    return Math.min(100, baseScore + activeMembersBonus);
  }

  private calculateMoodScore(): number {
    const members = Array.from(this.teamMembers.values());
    if (members.length === 0) return 50;
    
    const moodValues = {
      happy: 100,
      neutral: 50,
      stressed: 25,
      frustrated: 0,
    };
    
    const totalMood = members.reduce((sum, member) => {
      return sum + (moodValues[member.mood || 'neutral']);
    }, 0);
    
    return Math.round(totalMood / members.length);
  }

  private analyzeVelocityTrend(): 'increasing' | 'stable' | 'decreasing' {
    // Analyze historical data to determine trend
    // Simplified implementation
    const productivityScore = this.calculateProductivityScore();
    if (productivityScore > 80) return 'increasing';
    if (productivityScore > 50) return 'stable';
    return 'decreasing';
  }

  private assessBurnoutRisk(): 'low' | 'medium' | 'high' {
    const stressedMembers = Array.from(this.teamMembers.values())
      .filter(m => m.mood === 'stressed' || m.mood === 'frustrated').length;
    
    const overloadedMembers = Array.from(this.teamMembers.values())
      .filter(m => m.workload > 85).length;
    
    const riskScore = (stressedMembers * 2 + overloadedMembers) / this.teamMembers.size;
    
    if (riskScore < 0.2) return 'low';
    if (riskScore < 0.5) return 'medium';
    return 'high';
  }

  private async generateInsights(): Promise<TeamInsight[]> {
    const insights: TeamInsight[] = [];

    // Check for overloaded members
    this.teamMembers.forEach(member => {
      if (member.workload > 85) {
        insights.push({
          type: 'wellbeing',
          title: `${member.name} is overloaded`,
          description: `Workload at ${member.workload}% - consider redistributing tasks`,
          severity: 'warning',
          actionItems: [
            'Review current task assignments',
            'Consider delegating some responsibilities',
            'Schedule a one-on-one check-in',
          ],
          affectedMembers: [member.id],
        });
      }
    });

    // Check team mood
    const moodScore = this.calculateMoodScore();
    if (moodScore < 40) {
      insights.push({
        type: 'wellbeing',
        title: 'Low team morale detected',
        description: 'Team mood is below optimal levels',
        severity: 'critical',
        actionItems: [
          'Schedule a team meeting to address concerns',
          'Consider team building activities',
          'Review recent changes that may have impacted morale',
        ],
      });
    }

    // Check productivity
    const productivityScore = this.calculateProductivityScore();
    if (productivityScore < 60) {
      insights.push({
        type: 'productivity',
        title: 'Productivity below target',
        description: `Team productivity at ${productivityScore}%`,
        severity: 'warning',
        actionItems: [
          'Identify and remove blockers',
          'Review and optimize processes',
          'Consider additional training or resources',
        ],
      });
    }

    this.insights = insights;
    return insights;
  }

  private generateRecommendations(insights: TeamInsight[]): string[] {
    const recommendations: string[] = [];

    // Based on insights, generate specific recommendations
    if (insights.some(i => i.type === 'wellbeing' && i.severity === 'critical')) {
      recommendations.push('🚨 Immediate attention needed for team wellbeing');
      recommendations.push('Consider implementing flexible work hours');
      recommendations.push('Schedule regular mental health check-ins');
    }

    if (this.assessBurnoutRisk() === 'high') {
      recommendations.push('⚠️ High burnout risk - consider workload redistribution');
      recommendations.push('Implement mandatory break times');
      recommendations.push('Review project deadlines and priorities');
    }

    if (this.calculateCollaborationScore() < 60) {
      recommendations.push('💡 Improve team collaboration with daily standups');
      recommendations.push('Use pair programming or mob programming sessions');
      recommendations.push('Create dedicated collaboration time slots');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Team is performing well!');
      recommendations.push('Continue monitoring for early warning signs');
    }

    return recommendations;
  }

  // Meeting management
  public async scheduleMeeting(
    participants: string[],
    duration: number,
    context?: string
  ): Promise<Meeting> {
    try {
      // Find optimal time based on participants' availability
      const optimalTime = await this.findOptimalMeetingTime(participants, duration);
      
      // Determine meeting type based on context
      const meetingType = this.determineMeetingType(context, participants.length);
      
      // Generate AI suggestions for the meeting
      const suggestions = await this.generateMeetingSuggestions(meetingType, context);
      
      const meeting: Meeting = {
        id: `meeting_${Date.now()}`,
        title: context || `Team ${meetingType}`,
        participants,
        scheduledTime: optimalTime,
        duration,
        type: meetingType,
        aiSuggestions: suggestions,
        autoTranscribe: true,
      };

      this.meetings.set(meeting.id, meeting);
      
      // Send notifications to participants
      await this.notifyParticipants(meeting);
      
      return meeting;
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      throw error;
    }
  }

  private async findOptimalMeetingTime(
    participants: string[],
    duration: number
  ): Promise<Date> {
    // Find common available time slots
    // Simplified implementation - would integrate with calendar API
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    return tomorrow;
  }

  private determineMeetingType(
    context?: string,
    participantCount?: number
  ): Meeting['type'] {
    if (!context) return 'standup';
    
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('standup') || contextLower.includes('daily')) {
      return 'standup';
    }
    if (contextLower.includes('planning') || contextLower.includes('sprint')) {
      return 'planning';
    }
    if (contextLower.includes('review') || contextLower.includes('retro')) {
      return 'review';
    }
    if (contextLower.includes('brainstorm') || contextLower.includes('idea')) {
      return 'brainstorm';
    }
    if (participantCount === 2) {
      return 'one-on-one';
    }
    
    return 'standup';
  }

  private async generateMeetingSuggestions(
    type: Meeting['type'],
    context?: string
  ): Promise<string[]> {
    const suggestions: string[] = [];

    switch (type) {
      case 'standup':
        suggestions.push('Keep updates brief - 2 minutes per person');
        suggestions.push('Focus on: What did you do? What will you do? Any blockers?');
        suggestions.push('Consider time-boxing to 15 minutes');
        break;
      case 'planning':
        suggestions.push('Review backlog items before the meeting');
        suggestions.push('Ensure all stories have clear acceptance criteria');
        suggestions.push('Allocate time for capacity planning');
        break;
      case 'review':
        suggestions.push('Prepare demo environment in advance');
        suggestions.push('Focus on completed work and learnings');
        suggestions.push('Gather feedback from stakeholders');
        break;
      case 'brainstorm':
        suggestions.push('Start with a warm-up exercise');
        suggestions.push('Use "Yes, and..." technique');
        suggestions.push('Capture all ideas without judgment');
        break;
      case 'one-on-one':
        suggestions.push('Create a safe space for open discussion');
        suggestions.push('Review goals and progress');
        suggestions.push('Discuss career development and growth');
        break;
    }

    return suggestions;
  }

  private async notifyParticipants(meeting: Meeting): Promise<void> {
    // Send notifications to all participants
    // This would integrate with the notification system
    console.log(`Notifying participants about meeting: ${meeting.title}`);
  }

  // Workload balancing
  public async balanceWorkload(): Promise<Map<string, string[]>> {
    const recommendations = new Map<string, string[]>();
    
    // Find overloaded and underutilized members
    const overloaded = Array.from(this.teamMembers.values())
      .filter(m => m.workload > 80)
      .sort((a, b) => b.workload - a.workload);
    
    const underutilized = Array.from(this.teamMembers.values())
      .filter(m => m.workload < 40)
      .sort((a, b) => a.workload - b.workload);
    
    // Generate redistribution recommendations
    overloaded.forEach(member => {
      const tasks: string[] = [];
      underutilized.forEach(available => {
        // Check if skills match
        const sharedSkills = member.skills.filter(skill => 
          available.skills.includes(skill)
        );
        
        if (sharedSkills.length > 0) {
          tasks.push(`Reassign ${sharedSkills[0]} tasks to ${available.name}`);
        }
      });
      
      if (tasks.length > 0) {
        recommendations.set(member.id, tasks);
      }
    });
    
    return recommendations;
  }

  // Skills matrix
  public async generateSkillsMatrix(): Promise<Map<string, Map<string, number>>> {
    const matrix = new Map<string, Map<string, number>>();
    
    // Collect all unique skills
    const allSkills = new Set<string>();
    this.teamMembers.forEach(member => {
      member.skills.forEach(skill => allSkills.add(skill));
    });
    
    // Build matrix
    this.teamMembers.forEach(member => {
      const memberSkills = new Map<string, number>();
      allSkills.forEach(skill => {
        // Rate skill level (simplified - would be based on assessments)
        const level = member.skills.includes(skill) ? 
          Math.floor(Math.random() * 3) + 3 : 0; // 3-5 if has skill, 0 otherwise
        memberSkills.set(skill, level);
      });
      matrix.set(member.id, memberSkills);
    });
    
    return matrix;
  }

  // Real-time monitoring
  private startMonitoring() {
    // Monitor team health in real-time
    setInterval(async () => {
      await this.calculateMetrics();
      const insights = await this.generateInsights();
      
      // Alert on critical issues
      const criticalInsights = insights.filter(i => i.severity === 'critical');
      if (criticalInsights.length > 0) {
        this.alertManager(criticalInsights);
      }
    }, 60000); // Check every minute
  }

  private async calculateMetrics(): Promise<void> {
    // Recalculate all metrics
    this.teamMetrics = await this.analyzeTeam('current_team');
  }

  private alertManager(criticalInsights: TeamInsight[]) {
    // Send alerts to team manager
    console.log('Critical team issues detected:', criticalInsights);
    // Would integrate with notification system
  }

  // Configuration update
  public async updateConfig(config: Partial<AIConfig>) {
    this.config = {...this.config, ...config};
  }

  // Cleanup
  public async cleanup() {
    // Save team data
    await AsyncStorage.setItem('team_data', JSON.stringify({
      members: Array.from(this.teamMembers.values()),
      metrics: this.teamMetrics,
      insights: this.insights,
    }));
    
    // Clear temporary data
    this.meetings.clear();
  }
}
