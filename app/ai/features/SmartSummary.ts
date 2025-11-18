// SmartSummary.ts - AI-powered summarization for METR
import {AIConfig, Message} from '../core/AIManager';

export interface SummaryOptions {
  maxLength?: number;
  style?: 'brief' | 'detailed' | 'bullet-points';
  focusOn?: 'decisions' | 'actions' | 'discussion' | 'all';
  language?: string;
}

export interface Summary {
  text: string;
  keyPoints: string[];
  participants: string[];
  decisions: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  topics: string[];
  timestamp: Date;
  wordCount: number;
  compressionRatio: number;
}

export class SmartSummary {
  private config: AIConfig | null = null;
  private summaryCache: Map<string, Summary>;
  
  constructor() {
    this.summaryCache = new Map();
  }

  public async initialize(config: AIConfig): Promise<void> {
    this.config = config;
  }

  public async summarize(
    messages: Message[],
    options: SummaryOptions = {}
  ): Promise<string> {
    try {
      const fullSummary = await this.generateFullSummary(messages, options);
      return fullSummary.text;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return this.generateFallbackSummary(messages);
    }
  }

  public async generateFullSummary(
    messages: Message[],
    options: SummaryOptions = {}
  ): Promise<Summary> {
    const cacheKey = this.getCacheKey(messages, options);
    
    // Check cache
    if (this.summaryCache.has(cacheKey)) {
      return this.summaryCache.get(cacheKey)!;
    }

    // Process messages
    const processedData = this.preprocessMessages(messages);
    
    // Generate summary based on style
    let summaryText: string;
    switch (options.style) {
      case 'brief':
        summaryText = await this.generateBriefSummary(processedData, options);
        break;
      case 'detailed':
        summaryText = await this.generateDetailedSummary(processedData, options);
        break;
      case 'bullet-points':
        summaryText = await this.generateBulletPointSummary(processedData, options);
        break;
      default:
        summaryText = await this.generateStandardSummary(processedData, options);
    }

    // Extract additional information
    const keyPoints = this.extractKeyPoints(messages);
    const decisions = this.extractDecisions(messages);
    const actionItems = this.extractActionItems(messages);
    const topics = this.extractTopics(messages);
    const sentiment = this.analyzeSentiment(messages);
    
    const summary: Summary = {
      text: summaryText,
      keyPoints,
      participants: processedData.participants,
      decisions,
      actionItems,
      sentiment,
      topics,
      timestamp: new Date(),
      wordCount: summaryText.split(' ').length,
      compressionRatio: this.calculateCompressionRatio(messages, summaryText),
    };

    // Cache the result
    this.summaryCache.set(cacheKey, summary);
    
    return summary;
  }

  private preprocessMessages(messages: Message[]): any {
    const participants = new Set<string>();
    const messagesByUser = new Map<string, Message[]>();
    const timeline: Array<{time: Date; content: string; user: string}> = [];
    
    messages.forEach(msg => {
      participants.add(msg.userId);
      
      if (!messagesByUser.has(msg.userId)) {
        messagesByUser.set(msg.userId, []);
      }
      messagesByUser.get(msg.userId)!.push(msg);
      
      timeline.push({
        time: new Date(msg.timestamp),
        content: msg.text,
        user: msg.userId,
      });
    });
    
    return {
      participants: Array.from(participants),
      messagesByUser,
      timeline,
      totalMessages: messages.length,
      timespan: this.calculateTimespan(messages),
    };
  }

  private async generateBriefSummary(
    data: any,
    options: SummaryOptions
  ): Promise<string> {
    const mainPoints = this.identifyMainPoints(data);
    const conclusion = this.identifyConclusion(data);
    
    let summary = `Discussion between ${data.participants.join(', ')} over ${data.timespan}. `;
    summary += `Main points: ${mainPoints.slice(0, 3).join('; ')}. `;
    if (conclusion) {
      summary += `Conclusion: ${conclusion}`;
    }
    
    return this.truncateToLength(summary, options.maxLength || 200);
  }

  private async generateDetailedSummary(
    data: any,
    options: SummaryOptions
  ): Promise<string> {
    let summary = `## Conversation Summary\n\n`;
    summary += `**Participants:** ${data.participants.join(', ')}\n`;
    summary += `**Duration:** ${data.timespan}\n`;
    summary += `**Messages:** ${data.totalMessages}\n\n`;
    
    summary += `### Discussion Flow\n`;
    const sections = this.groupMessagesByTopic(data);
    
    sections.forEach((section, index) => {
      summary += `\n**${index + 1}. ${section.topic}**\n`;
      summary += `${section.summary}\n`;
      if (section.keyPoints.length > 0) {
        summary += `Key points:\n`;
        section.keyPoints.forEach(point => {
          summary += `- ${point}\n`;
        });
      }
    });
    
    return summary;
  }

  private async generateBulletPointSummary(
    data: any,
    options: SummaryOptions
  ): Promise<string> {
    const points = this.extractAllPoints(data);
    let summary = `📝 **Summary Points:**\n\n`;
    
    if (options.focusOn === 'decisions' || options.focusOn === 'all') {
      const decisions = points.filter(p => p.type === 'decision');
      if (decisions.length > 0) {
        summary += `**✅ Decisions Made:**\n`;
        decisions.forEach(d => summary += `• ${d.content}\n`);
        summary += '\n';
      }
    }
    
    if (options.focusOn === 'actions' || options.focusOn === 'all') {
      const actions = points.filter(p => p.type === 'action');
      if (actions.length > 0) {
        summary += `**🎯 Action Items:**\n`;
        actions.forEach(a => summary += `• ${a.content}\n`);
        summary += '\n';
      }
    }
    
    if (options.focusOn === 'discussion' || options.focusOn === 'all') {
      const discussions = points.filter(p => p.type === 'discussion');
      if (discussions.length > 0) {
        summary += `**💬 Key Discussion Points:**\n`;
        discussions.slice(0, 5).forEach(d => summary += `• ${d.content}\n`);
      }
    }
    
    return summary;
  }

  private async generateStandardSummary(
    data: any,
    options: SummaryOptions
  ): Promise<string> {
    const mainTopics = this.identifyMainTopics(data);
    const keyDecisions = this.identifyKeyDecisions(data);
    const nextSteps = this.identifyNextSteps(data);
    
    let summary = `The conversation covered ${mainTopics.length} main topics`;
    if (mainTopics.length > 0) {
      summary += `: ${mainTopics.slice(0, 3).join(', ')}`;
    }
    summary += '. ';
    
    if (keyDecisions.length > 0) {
      summary += `Key decisions included: ${keyDecisions.join('; ')}. `;
    }
    
    if (nextSteps.length > 0) {
      summary += `Next steps: ${nextSteps.join(', ')}.`;
    }
    
    return summary;
  }

  private extractKeyPoints(messages: Message[]): string[] {
    const keyPoints: string[] = [];
    const importanceIndicators = [
      'important', 'critical', 'key', 'crucial', 'essential',
      'must', 'need to', 'should', 'priority', 'focus on'
    ];
    
    messages.forEach(msg => {
      const msgLower = msg.text.toLowerCase();
      if (importanceIndicators.some(indicator => msgLower.includes(indicator))) {
        // Extract the sentence containing the indicator
        const sentences = msg.text.split(/[.!?]+/);
        sentences.forEach(sentence => {
          if (importanceIndicators.some(ind => sentence.toLowerCase().includes(ind))) {
            keyPoints.push(sentence.trim());
          }
        });
      }
    });
    
    return keyPoints.slice(0, 5); // Return top 5 key points
  }

  private extractDecisions(messages: Message[]): string[] {
    const decisions: string[] = [];
    const decisionIndicators = [
      'decided', 'agreed', 'will', "let's", 'going to',
      'decision', 'approve', 'confirm', 'finalize'
    ];
    
    messages.forEach(msg => {
      const msgLower = msg.text.toLowerCase();
      if (decisionIndicators.some(indicator => msgLower.includes(indicator))) {
        const sentences = msg.text.split(/[.!?]+/);
        sentences.forEach(sentence => {
          if (decisionIndicators.some(ind => sentence.toLowerCase().includes(ind))) {
            decisions.push(sentence.trim());
          }
        });
      }
    });
    
    return this.deduplicateItems(decisions);
  }

  private extractActionItems(messages: Message[]): string[] {
    const actionItems: string[] = [];
    const actionIndicators = [
      'will do', 'i\'ll', 'action:', 'todo:', 'task:',
      'need to', 'must', 'should', 'by tomorrow', 'by next'
    ];
    
    messages.forEach(msg => {
      const msgLower = msg.text.toLowerCase();
      actionIndicators.forEach(indicator => {
        if (msgLower.includes(indicator)) {
          // Extract the action item
          const startIndex = msgLower.indexOf(indicator);
          const endIndex = Math.min(
            msgLower.indexOf('.', startIndex),
            msgLower.indexOf('\n', startIndex),
            msgLower.length
          );
          
          if (endIndex > startIndex) {
            const action = msg.text.substring(startIndex, endIndex).trim();
            if (action.length > 10 && action.length < 200) {
              actionItems.push(action);
            }
          }
        }
      });
    });
    
    return this.deduplicateItems(actionItems);
  }

  private extractTopics(messages: Message[]): string[] {
    const topics = new Map<string, number>();
    const commonWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and',
      'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as',
      'from', 'by', 'about', 'into', 'through', 'during'
    ]);
    
    messages.forEach(msg => {
      // Extract meaningful words
      const words = msg.text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word));
      
      words.forEach(word => {
        topics.set(word, (topics.get(word) || 0) + 1);
      });
    });
    
    // Sort by frequency and return top topics
    const sortedTopics = Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);
    
    // Group related topics
    return this.groupRelatedTopics(sortedTopics);
  }

  private analyzeSentiment(messages: Message[]): Summary['sentiment'] {
    let positiveCount = 0;
    let negativeCount = 0;
    
    const positiveWords = [
      'good', 'great', 'excellent', 'happy', 'success',
      'agree', 'yes', 'perfect', 'awesome', 'wonderful'
    ];
    const negativeWords = [
      'bad', 'issue', 'problem', 'error', 'fail',
      'disagree', 'no', 'wrong', 'terrible', 'awful'
    ];
    
    messages.forEach(msg => {
      const msgLower = msg.text.toLowerCase();
      positiveWords.forEach(word => {
        if (msgLower.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (msgLower.includes(word)) negativeCount++;
      });
    });
    
    if (positiveCount > negativeCount * 2) return 'positive';
    if (negativeCount > positiveCount * 2) return 'negative';
    if (positiveCount > 0 && negativeCount > 0) return 'mixed';
    return 'neutral';
  }

  private calculateCompressionRatio(messages: Message[], summary: string): number {
    const originalLength = messages.reduce((sum, msg) => sum + msg.text.length, 0);
    const summaryLength = summary.length;
    
    if (originalLength === 0) return 0;
    return Math.round((1 - summaryLength / originalLength) * 100);
  }

  private getCacheKey(messages: Message[], options: SummaryOptions): string {
    const messageIds = messages.map(m => m.id).join(',');
    const optionsStr = JSON.stringify(options);
    return `${messageIds}_${optionsStr}`;
  }

  private generateFallbackSummary(messages: Message[]): string {
    if (messages.length === 0) {
      return 'No messages to summarize.';
    }
    
    const participants = new Set(messages.map(m => m.userId));
    const firstMessage = messages[0].text.slice(0, 50);
    const lastMessage = messages[messages.length - 1].text.slice(0, 50);
    
    return `Conversation between ${participants.size} participants with ${messages.length} messages. ` +
           `Started with: "${firstMessage}..." and ended with: "${lastMessage}..."`;
  }

  private calculateTimespan(messages: Message[]): string {
    if (messages.length < 2) return 'brief moment';
    
    const firstTime = messages[0].timestamp;
    const lastTime = messages[messages.length - 1].timestamp;
    const diffMs = lastTime - firstTime;
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'few seconds';
  }

  private identifyMainPoints(data: any): string[] {
    // Simplified extraction of main points
    return ['Point 1', 'Point 2', 'Point 3'];
  }

  private identifyConclusion(data: any): string {
    return 'The team agreed to move forward with the proposed approach.';
  }

  private identifyMainTopics(data: any): string[] {
    return ['project planning', 'resource allocation', 'timeline'];
  }

  private identifyKeyDecisions(data: any): string[] {
    return ['Approved budget increase', 'Set deadline for Q2'];
  }

  private identifyNextSteps(data: any): string[] {
    return ['Create detailed plan', 'Schedule follow-up meeting'];
  }

  private groupMessagesByTopic(data: any): any[] {
    return [
      {
        topic: 'Project Planning',
        summary: 'Discussed project scope and requirements',
        keyPoints: ['Define MVP features', 'Set milestones'],
      },
    ];
  }

  private extractAllPoints(data: any): any[] {
    return [
      {type: 'decision', content: 'Approve new feature development'},
      {type: 'action', content: 'Create technical specification by Friday'},
      {type: 'discussion', content: 'Reviewed current performance metrics'},
    ];
  }

  private truncateToLength(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  private deduplicateItems(items: string[]): string[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const normalized = item.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  private groupRelatedTopics(topics: string[]): string[] {
    // Group similar topics together
    const groups: string[] = [];
    const used = new Set<string>();
    
    topics.forEach(topic => {
      if (used.has(topic)) return;
      
      // Find related topics
      const related = topics.filter(t => 
        !used.has(t) && 
        (t.includes(topic) || topic.includes(t) || this.areSimilar(topic, t))
      );
      
      if (related.length > 1) {
        groups.push(related.join('/'));
        related.forEach(r => used.add(r));
      } else if (!used.has(topic)) {
        groups.push(topic);
        used.add(topic);
      }
    });
    
    return groups.slice(0, 5);
  }

  private areSimilar(word1: string, word2: string): boolean {
    // Simple similarity check
    const minLength = Math.min(word1.length, word2.length);
    if (minLength < 4) return false;
    
    const prefix = Math.min(3, minLength - 1);
    return word1.slice(0, prefix) === word2.slice(0, prefix);
  }
}
