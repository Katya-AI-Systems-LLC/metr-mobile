// EmotionAnalysis.ts - Emotion and sentiment analysis for METR
import {AIConfig, Message} from '../core/AIManager';

export interface EmotionProfile {
  userId: string;
  dominantEmotion: Emotion;
  emotionScores: Map<Emotion, number>;
  confidence: number;
  trend: 'improving' | 'stable' | 'declining';
  timestamp: Date;
}

export type Emotion = 'happy' | 'neutral' | 'stressed' | 'frustrated' | 'excited' | 'confused' | 'confident';

export interface TeamMoodAnalysis {
  overall: Emotion;
  individual: Map<string, Emotion>;
  trend: 'improving' | 'stable' | 'declining';
  riskFactors: string[];
  recommendations: string[];
  healthScore: number; // 0-100
}

export interface EmotionTrigger {
  trigger: string;
  emotion: Emotion;
  frequency: number;
  context: string[];
}

export class EmotionAnalysis {
  private config: AIConfig | null = null;
  private emotionHistory: Map<string, EmotionProfile[]>;
  private emotionPatterns: Map<string, EmotionTrigger[]>;
  
  // Emotion keywords and indicators
  private emotionIndicators = {
    happy: [
      'happy', 'great', 'excellent', 'awesome', 'fantastic', 'wonderful',
      '😊', '😄', '🎉', 'love', 'excited', 'amazing', 'perfect', 'yay'
    ],
    stressed: [
      'stressed', 'overwhelmed', 'busy', 'pressure', 'deadline', 'urgent',
      '😰', '😟', 'worried', 'anxious', 'tight', 'rush', 'swamped'
    ],
    frustrated: [
      'frustrated', 'annoying', 'irritated', 'angry', 'upset', 'blocked',
      '😤', '😠', '🤬', 'stuck', 'impossible', 'broken', 'failing'
    ],
    confused: [
      'confused', 'unclear', 'lost', "don't understand", 'what', 'how',
      '😕', '🤔', '❓', 'unsure', 'complicated', 'complex'
    ],
    excited: [
      'excited', 'can\'t wait', 'looking forward', 'thrilled', 'eager',
      '🚀', '✨', '🎯', 'pumped', 'motivated', 'inspired'
    ],
    confident: [
      'confident', 'sure', 'certain', 'ready', 'prepared', 'got this',
      '💪', '👍', '✅', 'easy', 'simple', 'no problem', 'will do'
    ],
    neutral: [
      'okay', 'fine', 'alright', 'sure', 'yes', 'no', 'maybe',
      'understood', 'got it', 'noted', 'thanks'
    ]
  };

  // Contextual modifiers
  private intensifiers = ['very', 'really', 'extremely', 'super', 'totally', 'absolutely'];
  private negations = ['not', "don't", "doesn't", "isn't", "aren't", "won't", "can't", 'never'];

  constructor() {
    this.emotionHistory = new Map();
    this.emotionPatterns = new Map();
  }

  public async initialize(config: AIConfig): Promise<void> {
    this.config = config;
  }

  public async analyze(
    messages: Message[]
  ): Promise<TeamMoodAnalysis> {
    try {
      const individualEmotions = new Map<string, Emotion>();
      const emotionCounts = new Map<Emotion, number>();
      
      // Group messages by user
      const messagesByUser = this.groupMessagesByUser(messages);
      
      // Analyze each user's emotions
      for (const [userId, userMessages] of messagesByUser) {
        const profile = await this.analyzeUserEmotions(userId, userMessages);
        individualEmotions.set(userId, profile.dominantEmotion);
        
        // Count emotions for overall analysis
        const currentCount = emotionCounts.get(profile.dominantEmotion) || 0;
        emotionCounts.set(profile.dominantEmotion, currentCount + 1);
      }
      
      // Determine overall team mood
      const overall = this.determineOverallMood(emotionCounts);
      
      // Analyze trend
      const trend = await this.analyzeTrend(individualEmotions);
      
      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(individualEmotions, messages);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(overall, individualEmotions, riskFactors);
      
      // Calculate health score
      const healthScore = this.calculateHealthScore(individualEmotions, riskFactors);
      
      return {
        overall,
        individual: individualEmotions,
        trend,
        riskFactors,
        recommendations,
        healthScore
      };
    } catch (error) {
      console.error('Failed to analyze emotions:', error);
      return this.getDefaultAnalysis();
    }
  }

  private async analyzeUserEmotions(
    userId: string,
    messages: Message[]
  ): Promise<EmotionProfile> {
    const emotionScores = new Map<Emotion, number>();
    
    // Initialize scores
    Object.keys(this.emotionIndicators).forEach(emotion => {
      emotionScores.set(emotion as Emotion, 0);
    });
    
    // Analyze each message
    messages.forEach(message => {
      const analysis = this.analyzeMessageEmotion(message.text);
      analysis.forEach((score, emotion) => {
        const currentScore = emotionScores.get(emotion) || 0;
        emotionScores.set(emotion, currentScore + score);
      });
    });
    
    // Determine dominant emotion
    let dominantEmotion: Emotion = 'neutral';
    let maxScore = 0;
    
    emotionScores.forEach((score, emotion) => {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    });
    
    // Calculate confidence
    const totalScore = Array.from(emotionScores.values()).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? (maxScore / totalScore) * 100 : 50;
    
    // Determine trend
    const trend = await this.analyzeUserTrend(userId, dominantEmotion);
    
    const profile: EmotionProfile = {
      userId,
      dominantEmotion,
      emotionScores,
      confidence,
      trend,
      timestamp: new Date()
    };
    
    // Store in history
    if (!this.emotionHistory.has(userId)) {
      this.emotionHistory.set(userId, []);
    }
    this.emotionHistory.get(userId)!.push(profile);
    
    return profile;
  }

  private analyzeMessageEmotion(text: string): Map<Emotion, number> {
    const scores = new Map<Emotion, number>();
    const textLower = text.toLowerCase();
    
    // Check for emotion indicators
    Object.entries(this.emotionIndicators).forEach(([emotion, indicators]) => {
      let score = 0;
      
      indicators.forEach(indicator => {
        if (textLower.includes(indicator)) {
          score += 1;
          
          // Check for intensifiers
          this.intensifiers.forEach(intensifier => {
            if (textLower.includes(`${intensifier} ${indicator}`)) {
              score += 0.5;
            }
          });
        }
      });
      
      // Check for negations (reverse emotions)
      this.negations.forEach(negation => {
        indicators.forEach(indicator => {
          if (textLower.includes(`${negation} ${indicator}`)) {
            score = -score; // Reverse the emotion
          }
        });
      });
      
      if (score > 0) {
        scores.set(emotion as Emotion, score);
      }
    });
    
    // Analyze sentence structure and punctuation
    if (text.includes('!')) scores.set('excited', (scores.get('excited') || 0) + 0.5);
    if (text.includes('?')) scores.set('confused', (scores.get('confused') || 0) + 0.3);
    if (text.includes('...')) scores.set('neutral', (scores.get('neutral') || 0) + 0.3);
    
    // Check message length (very short messages often neutral)
    if (text.length < 10) {
      scores.set('neutral', (scores.get('neutral') || 0) + 1);
    }
    
    // If no clear emotion, default to neutral
    if (scores.size === 0) {
      scores.set('neutral', 1);
    }
    
    return scores;
  }

  private groupMessagesByUser(messages: Message[]): Map<string, Message[]> {
    const grouped = new Map<string, Message[]>();
    
    messages.forEach(message => {
      if (!grouped.has(message.userId)) {
        grouped.set(message.userId, []);
      }
      grouped.get(message.userId)!.push(message);
    });
    
    return grouped;
  }

  private determineOverallMood(emotionCounts: Map<Emotion, number>): Emotion {
    if (emotionCounts.size === 0) return 'neutral';
    
    // Weight emotions by their impact on team
    const emotionWeights: Record<Emotion, number> = {
      happy: 1.2,
      excited: 1.1,
      confident: 1.0,
      neutral: 0.8,
      confused: 0.6,
      stressed: 0.4,
      frustrated: 0.3
    };
    
    let bestEmotion: Emotion = 'neutral';
    let bestScore = 0;
    
    emotionCounts.forEach((count, emotion) => {
      const weight = emotionWeights[emotion] || 0.5;
      const score = count * weight;
      
      if (score > bestScore) {
        bestScore = score;
        bestEmotion = emotion;
      }
    });
    
    return bestEmotion;
  }

  private async analyzeTrend(
    currentEmotions: Map<string, Emotion>
  ): Promise<'improving' | 'stable' | 'declining'> {
    // Compare with historical data
    let improvingCount = 0;
    let decliningCount = 0;
    
    currentEmotions.forEach((emotion, userId) => {
      const history = this.emotionHistory.get(userId);
      if (history && history.length > 1) {
        const previous = history[history.length - 2];
        const emotionRank = this.getEmotionRank(emotion);
        const previousRank = this.getEmotionRank(previous.dominantEmotion);
        
        if (emotionRank > previousRank) improvingCount++;
        else if (emotionRank < previousRank) decliningCount++;
      }
    });
    
    if (improvingCount > decliningCount) return 'improving';
    if (decliningCount > improvingCount) return 'declining';
    return 'stable';
  }

  private async analyzeUserTrend(
    userId: string,
    currentEmotion: Emotion
  ): Promise<'improving' | 'stable' | 'declining'> {
    const history = this.emotionHistory.get(userId);
    if (!history || history.length < 2) return 'stable';
    
    const recentEmotions = history.slice(-5); // Last 5 readings
    const emotionRanks = recentEmotions.map(p => this.getEmotionRank(p.dominantEmotion));
    
    // Calculate trend
    let trend = 0;
    for (let i = 1; i < emotionRanks.length; i++) {
      trend += emotionRanks[i] - emotionRanks[i - 1];
    }
    
    if (trend > 1) return 'improving';
    if (trend < -1) return 'declining';
    return 'stable';
  }

  private getEmotionRank(emotion: Emotion): number {
    const ranks: Record<Emotion, number> = {
      happy: 7,
      excited: 6,
      confident: 5,
      neutral: 4,
      confused: 3,
      stressed: 2,
      frustrated: 1
    };
    
    return ranks[emotion] || 4;
  }

  private identifyRiskFactors(
    emotions: Map<string, Emotion>,
    messages: Message[]
  ): string[] {
    const riskFactors: string[] = [];
    
    // Check for negative emotions
    let negativeCount = 0;
    emotions.forEach(emotion => {
      if (['stressed', 'frustrated', 'confused'].includes(emotion)) {
        negativeCount++;
      }
    });
    
    if (negativeCount > emotions.size * 0.5) {
      riskFactors.push('High percentage of team experiencing negative emotions');
    }
    
    // Check for emotion clustering
    const emotionGroups = new Map<Emotion, number>();
    emotions.forEach(emotion => {
      emotionGroups.set(emotion, (emotionGroups.get(emotion) || 0) + 1);
    });
    
    emotionGroups.forEach((count, emotion) => {
      if (count > emotions.size * 0.6 && ['stressed', 'frustrated'].includes(emotion)) {
        riskFactors.push(`Widespread ${emotion} affecting majority of team`);
      }
    });
    
    // Check for communication breakdown indicators
    const shortMessages = messages.filter(m => m.text.length < 20).length;
    if (shortMessages > messages.length * 0.7) {
      riskFactors.push('Limited communication - mostly short responses');
    }
    
    // Check for conflict indicators
    const conflictWords = ['disagree', 'wrong', 'no', 'but', 'however', 'actually'];
    let conflictCount = 0;
    messages.forEach(msg => {
      conflictWords.forEach(word => {
        if (msg.text.toLowerCase().includes(word)) conflictCount++;
      });
    });
    
    if (conflictCount > messages.length * 0.3) {
      riskFactors.push('Potential conflicts or disagreements detected');
    }
    
    return riskFactors;
  }

  private generateRecommendations(
    overall: Emotion,
    individual: Map<string, Emotion>,
    riskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Overall mood recommendations
    switch (overall) {
      case 'stressed':
        recommendations.push('Consider redistributing workload to reduce stress');
        recommendations.push('Schedule a team break or relaxation activity');
        recommendations.push('Review and adjust project deadlines if possible');
        break;
      case 'frustrated':
        recommendations.push('Hold a problem-solving session to address blockers');
        recommendations.push('Provide additional support or resources');
        recommendations.push('Clarify goals and expectations');
        break;
      case 'confused':
        recommendations.push('Organize a clarification meeting');
        recommendations.push('Create or update documentation');
        recommendations.push('Assign mentors or buddies for support');
        break;
      case 'neutral':
        recommendations.push('Engage team with new challenges or goals');
        recommendations.push('Recognize recent achievements');
        break;
      case 'happy':
      case 'excited':
      case 'confident':
        recommendations.push('Maintain momentum with clear next steps');
        recommendations.push('Celebrate successes with the team');
        break;
    }
    
    // Risk-based recommendations
    if (riskFactors.length > 2) {
      recommendations.push('⚠️ Multiple risk factors detected - consider immediate intervention');
    }
    
    // Individual support recommendations
    const needsSupport = Array.from(individual.entries())
      .filter(([, emotion]) => ['stressed', 'frustrated'].includes(emotion));
    
    if (needsSupport.length > 0) {
      recommendations.push(`Schedule one-on-ones with ${needsSupport.length} team member(s) needing support`);
    }
    
    return recommendations;
  }

  private calculateHealthScore(
    emotions: Map<string, Emotion>,
    riskFactors: string[]
  ): number {
    let score = 100;
    
    // Deduct for negative emotions
    emotions.forEach(emotion => {
      switch (emotion) {
        case 'frustrated':
          score -= 15;
          break;
        case 'stressed':
          score -= 10;
          break;
        case 'confused':
          score -= 5;
          break;
      }
    });
    
    // Deduct for risk factors
    score -= riskFactors.length * 10;
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  private getDefaultAnalysis(): TeamMoodAnalysis {
    return {
      overall: 'neutral',
      individual: new Map(),
      trend: 'stable',
      riskFactors: [],
      recommendations: ['Unable to analyze emotions at this time'],
      healthScore: 50
    };
  }

  // Pattern detection for proactive support
  public async detectEmotionPatterns(userId: string): Promise<EmotionTrigger[]> {
    const patterns: EmotionTrigger[] = [];
    const history = this.emotionHistory.get(userId);
    
    if (!history || history.length < 5) {
      return patterns;
    }
    
    // Analyze recurring patterns
    const emotionSequences = new Map<string, number>();
    
    for (let i = 1; i < history.length; i++) {
      const sequence = `${history[i-1].dominantEmotion}->${history[i].dominantEmotion}`;
      emotionSequences.set(sequence, (emotionSequences.get(sequence) || 0) + 1);
    }
    
    // Identify significant patterns
    emotionSequences.forEach((count, sequence) => {
      if (count >= 3) {
        const [trigger, result] = sequence.split('->');
        patterns.push({
          trigger,
          emotion: result as Emotion,
          frequency: count,
          context: [] // Would analyze context in real implementation
        });
      }
    });
    
    return patterns;
  }

  // Real-time emotion monitoring
  public async monitorRealTimeEmotion(message: Message): Promise<EmotionProfile> {
    const emotions = this.analyzeMessageEmotion(message.text);
    
    // Get dominant emotion from single message
    let dominantEmotion: Emotion = 'neutral';
    let maxScore = 0;
    
    emotions.forEach((score, emotion) => {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    });
    
    return {
      userId: message.userId,
      dominantEmotion,
      emotionScores: emotions,
      confidence: Math.min(maxScore * 20, 100), // Scale confidence
      trend: 'stable',
      timestamp: new Date()
    };
  }
}
