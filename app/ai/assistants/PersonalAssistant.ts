// PersonalAssistant.ts - Personal AI Assistant for METR users
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AIConfig, AIContext, Message} from '../core/AIManager';

export interface PersonalAssistantConfig extends AIConfig {
  personality?: 'professional' | 'friendly' | 'concise' | 'detailed';
  language?: string;
  timezone?: string;
  customPrompts?: Record<string, string>;
}

export interface UserProfile {
  userId: string;
  name: string;
  role: string;
  preferences: {
    workingHours: {start: string; end: string};
    focusTime: string[];
    communicationStyle: string;
    aiPersonality: string;
  };
  skills: string[];
  currentProjects: string[];
}

export interface ConversationMemory {
  shortTerm: Message[];
  longTerm: {
    topics: string[];
    decisions: string[];
    preferences: Record<string, any>;
  };
  context: {
    lastInteraction: Date;
    currentTask?: string;
    mood?: string;
  };
}

export class PersonalAssistant {
  private config: PersonalAssistantConfig;
  private userProfile: UserProfile | null = null;
  private memory: ConversationMemory;
  private learningData: Map<string, any>;
  private apiClient: any; // OpenAI or local model client

  constructor(config: PersonalAssistantConfig) {
    this.config = config;
    this.memory = this.initializeMemory();
    this.learningData = new Map();
    this.initializeApiClient();
    this.loadUserProfile();
  }

  private initializeMemory(): ConversationMemory {
    return {
      shortTerm: [],
      longTerm: {
        topics: [],
        decisions: [],
        preferences: {},
      },
      context: {
        lastInteraction: new Date(),
      },
    };
  }

  private async initializeApiClient() {
    // Initialize API client based on provider
    switch (this.config.preferredProvider) {
      case 'openai':
        // Initialize OpenAI client
        break;
      case 'anthropic':
        // Initialize Anthropic client
        break;
      case 'local':
        // Initialize local model
        break;
    }
  }

  private async loadUserProfile() {
    try {
      const profile = await AsyncStorage.getItem('user_profile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  // Main query processing
  public async processQuery(
    query: string,
    context?: AIContext
  ): Promise<string> {
    try {
      // Add to short-term memory
      this.addToMemory({
        id: Date.now().toString(),
        text: query,
        userId: context?.userId || 'user',
        timestamp: Date.now(),
      });

      // Analyze query intent
      const intent = await this.analyzeIntent(query);

      // Process based on intent
      let response: string;
      switch (intent.type) {
        case 'task':
          response = await this.handleTaskQuery(query, intent);
          break;
        case 'information':
          response = await this.handleInformationQuery(query, intent);
          break;
        case 'scheduling':
          response = await this.handleSchedulingQuery(query, intent);
          break;
        case 'analysis':
          response = await this.handleAnalysisQuery(query, intent);
          break;
        case 'creative':
          response = await this.handleCreativeQuery(query, intent);
          break;
        default:
          response = await this.handleGeneralQuery(query);
      }

      // Learn from interaction
      this.learnFromInteraction(query, response, intent);

      return response;
    } catch (error) {
      console.error('Failed to process query:', error);
      return "I encountered an issue processing your request. Please try again.";
    }
  }

  // Intent analysis
  private async analyzeIntent(query: string): Promise<any> {
    const keywords = {
      task: ['task', 'todo', 'do', 'complete', 'finish', 'deadline'],
      information: ['what', 'how', 'why', 'when', 'where', 'who', 'explain'],
      scheduling: ['meeting', 'schedule', 'calendar', 'appointment', 'book'],
      analysis: ['analyze', 'review', 'insights', 'metrics', 'performance'],
      creative: ['create', 'generate', 'write', 'design', 'brainstorm'],
    };

    // Simple keyword-based intent detection
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => query.toLowerCase().includes(word))) {
        return {
          type,
          confidence: 0.8,
          entities: this.extractEntities(query),
        };
      }
    }

    return {type: 'general', confidence: 0.5, entities: []};
  }

  private extractEntities(query: string): any[] {
    // Extract dates, people, projects, etc.
    const entities = [];
    
    // Date extraction
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\btomorrow\b|\btoday\b|\bnext week\b)/gi;
    const dates = query.match(datePattern);
    if (dates) {
      entities.push(...dates.map(date => ({type: 'date', value: date})));
    }

    // Time extraction
    const timePattern = /(\d{1,2}:\d{2}\s?(am|pm)?|\d{1,2}\s?(am|pm))/gi;
    const times = query.match(timePattern);
    if (times) {
      entities.push(...times.map(time => ({type: 'time', value: time})));
    }

    return entities;
  }

  // Query handlers
  private async handleTaskQuery(query: string, intent: any): Promise<string> {
    // Handle task-related queries
    const taskKeywords = ['create', 'add', 'update', 'complete', 'list'];
    
    if (query.includes('create') || query.includes('add')) {
      return `I'll create that task for you. What would you like to add as the task description?`;
    } else if (query.includes('list')) {
      return `Here are your current tasks:\n1. Review team performance metrics\n2. Prepare presentation for tomorrow\n3. Respond to client emails`;
    } else if (query.includes('complete')) {
      return `Great! I've marked that task as completed. Your productivity score has increased by 5 points!`;
    }
    
    return `I can help you manage your tasks. What would you like to do?`;
  }

  private async handleInformationQuery(query: string, intent: any): Promise<string> {
    // Handle information requests
    return `Based on your query, here's what I found: [Information would be retrieved from knowledge base]`;
  }

  private async handleSchedulingQuery(query: string, intent: any): Promise<string> {
    // Handle scheduling requests
    const entities = intent.entities;
    const dates = entities.filter((e: any) => e.type === 'date');
    const times = entities.filter((e: any) => e.type === 'time');
    
    if (dates.length > 0 || times.length > 0) {
      return `I can schedule that meeting for ${dates[0]?.value || 'the requested date'} at ${times[0]?.value || 'your preferred time'}. Would you like me to send invitations?`;
    }
    
    return `I can help you schedule meetings. What time works best for you?`;
  }

  private async handleAnalysisQuery(query: string, intent: any): Promise<string> {
    // Handle analysis requests
    return `I'll analyze that for you. Based on the data, here are my insights: [Analysis would be performed]`;
  }

  private async handleCreativeQuery(query: string, intent: any): Promise<string> {
    // Handle creative requests
    return `I'll help you create that. Let me generate some ideas for you: [Creative content would be generated]`;
  }

  private async handleGeneralQuery(query: string): Promise<string> {
    // Handle general queries
    return `I'm here to help! ${query.includes('?') ? "Let me find that information for you." : "How can I assist you with that?"}`;
  }

  // Smart reply generation - Enhanced with AI context understanding
  public async generateSmartReplies(
    message: string,
    context?: AIContext
  ): Promise<string[]> {
    try {
      // Analyze message sentiment and context
      const sentiment = await this.analyzeSentiment(message);
      const messageType = this.detectMessageType(message);
      const entities = this.extractEntities(message);
      const urgency = this.detectUrgency(message);
      const conversationHistory = this.getRecentConversation(context);

      // Generate contextual replies using AI understanding
      const replies: string[] = [];

      // Context-aware reply generation
      if (messageType === 'question') {
        const questionType = this.classifyQuestion(message);
        
        if (questionType === 'yes_no') {
          replies.push("Yes, that's correct.", "No, not quite.", "Let me check on that.");
        } else if (questionType === 'when') {
          const dateEntity = entities.find(e => e.type === 'date');
          replies.push(
            dateEntity ? `I'll schedule it for ${dateEntity.value}.` : "I'll check the calendar and get back to you.",
            "Let me find a time that works for everyone.",
            "I'll coordinate with the team and confirm."
          );
        } else if (questionType === 'how') {
          replies.push(
            "I'll walk you through it step by step.",
            "Here's how we can approach this:",
            "Let me break this down for you."
          );
        } else {
          replies.push(
            "I'll look into that and get back to you.",
            "Good question! Let me check on that.",
            "I need to verify a few details first."
          );
        }
      } else if (messageType === 'request') {
        if (urgency === 'high') {
          replies.push(
            "I'll handle that right away!",
            "On it immediately!",
            "Priority task - starting now."
          );
        } else {
          replies.push(
            "I'll handle that right away.",
            "Consider it done!",
            "I'll get started on that."
          );
        }
      } else if (sentiment === 'positive') {
        // Match the enthusiasm level
        const enthusiasm = this.detectEnthusiasm(message);
        if (enthusiasm === 'high') {
          replies.push(
            "That's absolutely fantastic! 🎉",
            "Incredible work! Keep it up!",
            "Amazing! This is great news!"
          );
        } else {
          replies.push(
            "That's great news!",
            "Excellent work!",
            "Thanks for sharing!"
          );
        }
      } else if (sentiment === 'negative') {
        // Provide empathetic and solution-oriented replies
        replies.push(
          "I understand your concern. Let's work through this together.",
          "I'm here to help resolve this. What do you need?",
          "That's frustrating. Let me help you find a solution."
        );
      } else {
        // Context-aware neutral replies
        if (conversationHistory.length > 0) {
          const lastTopic = this.extractTopic(conversationHistory[conversationHistory.length - 1].text);
          replies.push(
            `Got it regarding ${lastTopic}.`,
            "Understood. I'll follow up on this.",
            "Noted. I'll make sure this is addressed."
          );
        } else {
          replies.push(
            "Got it, thanks!",
            "Understood.",
            "I'll make a note of that."
          );
        }
      }

      // Personalize replies based on user profile
      const personalizedReplies = this.personalizeReplies(replies, context);

      // Rank replies by relevance
      const rankedReplies = await this.rankReplies(personalizedReplies, message, context);

      return rankedReplies.slice(0, 3); // Return top 3 suggestions
    } catch (error) {
      console.error('Failed to generate smart replies:', error);
      return ["Got it!", "Thanks!", "I'll look into it."];
    }
  }

  private classifyQuestion(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('yes') || lower.includes('no') || lower.match(/\bis\b|\bare\b|\bdo\b|\bdoes\b|\bcan\b|\bcould\b|\bshould\b/)) {
      return 'yes_no';
    }
    if (lower.includes('when') || lower.includes('what time')) return 'when';
    if (lower.includes('how')) return 'how';
    if (lower.includes('why')) return 'why';
    if (lower.includes('where')) return 'where';
    if (lower.includes('who')) return 'who';
    return 'general';
  }

  private detectUrgency(message: string): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'now', 'right away'];
    const lower = message.toLowerCase();
    
    if (urgentKeywords.some(keyword => lower.includes(keyword))) {
      return 'high';
    }
    if (message.includes('!') && message.split('!').length > 2) {
      return 'high';
    }
    return 'medium';
  }

  private detectEnthusiasm(message: string): 'high' | 'medium' | 'low' {
    const enthusiasmMarkers = message.match(/!+/g);
    const emojiCount = (message.match(/[🎉🎊🚀✨🔥💪]/g) || []).length;
    
    if ((enthusiasmMarkers && enthusiasmMarkers.length > 2) || emojiCount > 2) {
      return 'high';
    }
    if (enthusiasmMarkers || emojiCount > 0) {
      return 'medium';
    }
    return 'low';
  }

  private getRecentConversation(context?: AIContext): Message[] {
    if (!context || !this.memory.shortTerm) return [];
    return this.memory.shortTerm.slice(-5); // Last 5 messages
  }

  private extractTopic(text: string): string {
    // Simple topic extraction - in production would use NLP
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const keywords = words.filter(w => w.length > 4 && !stopWords.includes(w));
    return keywords[0] || 'this';
  }

  private personalizeReplies(replies: string[], context?: AIContext): string[] {
    if (!this.userProfile) return replies;
    
    const personality = this.userProfile.preferences.aiPersonality;
    
    if (personality === 'concise') {
      return replies.map(r => this.makeConcise(r));
    } else if (personality === 'detailed') {
      return replies.map(r => this.addDetail(r));
    } else if (personality === 'friendly') {
      return replies.map(r => this.makeFriendly(r));
    }
    
    return replies;
  }

  private makeConcise(reply: string): string {
    // Remove filler words
    return reply.replace(/\b(I'll|I will|Let me)\b/gi, '').trim();
  }

  private addDetail(reply: string): string {
    if (!reply.includes(':')) {
      return reply + " Here are the details:";
    }
    return reply;
  }

  private makeFriendly(reply: string): string {
    if (!reply.includes('!') && !reply.includes('😊')) {
      return reply.replace(/\.$/, '! 😊');
    }
    return reply;
  }

  private async rankReplies(replies: string[], message: string, context?: AIContext): Promise<string[]> {
    // Rank replies by relevance, context match, and user preferences
    const scored = replies.map(reply => ({
      reply,
      score: this.calculateRelevanceScore(reply, message, context),
    }));
    
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.reply);
  }

  private calculateRelevanceScore(reply: string, message: string, context?: AIContext): number {
    let score = 0;
    
    // Check for keyword overlap
    const messageWords = new Set(message.toLowerCase().split(/\s+/));
    const replyWords = reply.toLowerCase().split(/\s+/);
    const overlap = replyWords.filter(w => messageWords.has(w)).length;
    score += overlap * 10;
    
    // Check for context match
    if (context && this.memory.context.currentTask) {
      if (reply.toLowerCase().includes(this.memory.context.currentTask.toLowerCase())) {
        score += 20;
      }
    }
    
    // Prefer shorter replies (easier to use)
    score += (100 - reply.length) / 10;
    
    return score;
  }

  private async analyzeSentiment(text: string): Promise<string> {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'thanks', 'awesome'];
    const negativeWords = ['bad', 'issue', 'problem', 'error', 'failed', 'wrong'];

    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private detectMessageType(message: string): string {
    if (message.includes('?')) return 'question';
    if (message.includes('please') || message.includes('could') || message.includes('would')) return 'request';
    if (message.includes('!')) return 'exclamation';
    return 'statement';
  }

  // Code review functionality
  public async reviewCode(
    code: string,
    language: string
  ): Promise<{
    issues: Array<{line: number; severity: string; message: string}>;
    suggestions: string[];
    score: number;
  }> {
    try {
      const issues: Array<{line: number; severity: string; message: string}> = [];
      const suggestions: string[] = [];
      let score = 100;

      // Parse code and analyze
      const lines = code.split('\n');
      
      // Check for common issues
      lines.forEach((line, index) => {
        // Check for console.log statements
        if (line.includes('console.log')) {
          issues.push({
            line: index + 1,
            severity: 'warning',
            message: 'Remove console.log statements before production',
          });
          score -= 5;
        }

        // Check for TODO comments
        if (line.includes('TODO')) {
          issues.push({
            line: index + 1,
            severity: 'info',
            message: 'TODO comment found - consider addressing it',
          });
          score -= 2;
        }

        // Check for long lines
        if (line.length > 120) {
          issues.push({
            line: index + 1,
            severity: 'warning',
            message: 'Line exceeds 120 characters',
          });
          score -= 3;
        }
      });

      // Language-specific checks
      if (language === 'javascript' || language === 'typescript') {
        // Check for var usage
        if (code.includes('var ')) {
          suggestions.push('Consider using let or const instead of var');
          score -= 10;
        }

        // Check for async/await usage
        if (code.includes('.then(') && !code.includes('async')) {
          suggestions.push('Consider using async/await for better readability');
        }
      }

      // Add general suggestions
      if (issues.length === 0) {
        suggestions.push('Code looks good! No major issues found.');
      } else {
        suggestions.push(`Found ${issues.length} potential improvements.`);
      }

      return {
        issues,
        suggestions,
        score: Math.max(0, score),
      };
    } catch (error) {
      console.error('Failed to review code:', error);
      return {
        issues: [],
        suggestions: ['Unable to analyze code at this time.'],
        score: 0,
      };
    }
  }

  // Learning and adaptation
  private learnFromInteraction(query: string, response: string, intent: any) {
    // Store interaction patterns
    const pattern = {
      query,
      response,
      intent,
      timestamp: Date.now(),
      successful: true, // Would be determined by user feedback
    };

    const patterns = this.learningData.get('patterns') || [];
    patterns.push(pattern);
    this.learningData.set('patterns', patterns);

    // Update preferences based on interactions
    this.updatePreferences(intent);
  }

  private updatePreferences(intent: any) {
    if (!this.memory.longTerm.preferences[intent.type]) {
      this.memory.longTerm.preferences[intent.type] = 0;
    }
    this.memory.longTerm.preferences[intent.type]++;
  }

  // Memory management
  private addToMemory(message: Message) {
    this.memory.shortTerm.push(message);
    
    // Keep only last 50 messages in short-term memory
    if (this.memory.shortTerm.length > 50) {
      this.memory.shortTerm = this.memory.shortTerm.slice(-50);
    }

    // Update context
    this.memory.context.lastInteraction = new Date();
  }

  // Configuration updates
  public async updateConfig(config: Partial<PersonalAssistantConfig>) {
    this.config = {...this.config, ...config};
    await this.initializeApiClient();
  }

  // Cleanup
  public async cleanup() {
    // Save learning data
    await AsyncStorage.setItem('ai_learning_data', JSON.stringify(
      Array.from(this.learningData.entries())
    ));

    // Save memory
    await AsyncStorage.setItem('ai_memory', JSON.stringify(this.memory));

    // Clear temporary data
    this.memory.shortTerm = [];
    this.learningData.clear();
  }
}
