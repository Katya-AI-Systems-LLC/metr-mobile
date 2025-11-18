// AIManager.ts - Core AI orchestrator for METR
import {NativeModules, DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PersonalAssistant} from '../assistants/PersonalAssistant';
import {TeamAssistant} from '../assistants/TeamAssistant';
import {SmartSummary} from '../features/SmartSummary';
import {EmotionAnalysis} from '../features/EmotionAnalysis';
import {ActionExtractor} from '../features/ActionExtractor';
import {ProductivityInsights} from '../features/ProductivityInsights';
import {ModelLoader} from './ModelLoader';
import {TokenManager} from './TokenManager';

export interface AIConfig {
  enableLocalProcessing: boolean;
  enableCloudProcessing: boolean;
  preferredProvider: 'openai' | 'anthropic' | 'local' | 'huggingface';
  privacyMode: 'strict' | 'balanced' | 'performance';
  maxTokensPerRequest: number;
  cacheEnabled: boolean;
}

export interface AIContext {
  userId: string;
  teamId?: string;
  channelId?: string;
  conversationHistory?: Message[];
  userPreferences?: UserPreferences;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: number;
  metadata?: any;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  workingHours: {start: string; end: string};
  aiPersonality: 'professional' | 'friendly' | 'concise' | 'detailed';
}

class AIManager {
  private static instance: AIManager;
  private config: AIConfig;
  private personalAssistant: PersonalAssistant | null = null;
  private teamAssistant: TeamAssistant | null = null;
  private modelLoader: ModelLoader;
  private tokenManager: TokenManager;
  private isInitialized: boolean = false;

  // Feature modules
  private smartSummary: SmartSummary;
  private emotionAnalysis: EmotionAnalysis;
  private actionExtractor: ActionExtractor;
  private productivityInsights: ProductivityInsights;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.modelLoader = new ModelLoader();
    this.tokenManager = new TokenManager();
    
    // Initialize feature modules
    this.smartSummary = new SmartSummary();
    this.emotionAnalysis = new EmotionAnalysis();
    this.actionExtractor = new ActionExtractor();
    this.productivityInsights = new ProductivityInsights();
  }

  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  private getDefaultConfig(): AIConfig {
    return {
      enableLocalProcessing: true,
      enableCloudProcessing: true,
      preferredProvider: 'openai',
      privacyMode: 'balanced',
      maxTokensPerRequest: 2000,
      cacheEnabled: true,
    };
  }

  public async initialize(config?: Partial<AIConfig>): Promise<void> {
    if (this.isInitialized) {
      console.log('AIManager already initialized');
      return;
    }

    try {
      // Merge with default config
      this.config = {...this.config, ...config};

      // Load saved preferences
      const savedConfig = await AsyncStorage.getItem('ai_config');
      if (savedConfig) {
        this.config = {...this.config, ...JSON.parse(savedConfig)};
      }

      // Initialize model loader
      await this.modelLoader.initialize({
        enableLocalModels: this.config.enableLocalProcessing,
        modelsPath: 'models/',
      });

      // Initialize token manager
      await this.tokenManager.initialize();

      // Load assistants based on config
      if (this.config.enableCloudProcessing || this.config.enableLocalProcessing) {
        this.personalAssistant = new PersonalAssistant(this.config);
        this.teamAssistant = new TeamAssistant(this.config);
      }

      // Initialize feature modules
      await Promise.all([
        this.smartSummary.initialize(this.config),
        this.emotionAnalysis.initialize(this.config),
        this.actionExtractor.initialize(this.config),
        this.productivityInsights.initialize(this.config),
      ]);

      this.isInitialized = true;
      DeviceEventEmitter.emit('ai_initialized');
      
      console.log('AIManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AIManager:', error);
      throw error;
    }
  }

  // Personal Assistant Methods
  public async askAssistant(
    question: string,
    context?: AIContext
  ): Promise<string> {
    if (!this.personalAssistant) {
      throw new Error('Personal Assistant not initialized');
    }
    return this.personalAssistant.processQuery(question, context);
  }

  public async getSmartReply(
    message: string,
    context?: AIContext
  ): Promise<string[]> {
    if (!this.personalAssistant) {
      throw new Error('Personal Assistant not initialized');
    }
    return this.personalAssistant.generateSmartReplies(message, context);
  }

  // Team Assistant Methods
  public async getTeamInsights(teamId: string): Promise<any> {
    if (!this.teamAssistant) {
      throw new Error('Team Assistant not initialized');
    }
    return this.teamAssistant.analyzeTeam(teamId);
  }

  public async scheduleSmartMeeting(
    participants: string[],
    duration: number,
    context?: string
  ): Promise<any> {
    if (!this.teamAssistant) {
      throw new Error('Team Assistant not initialized');
    }
    return this.teamAssistant.scheduleMeeting(participants, duration, context);
  }

  // Smart Features
  public async summarizeConversation(
    messages: Message[],
    options?: {maxLength?: number; style?: 'brief' | 'detailed'}
  ): Promise<string> {
    return this.smartSummary.summarize(messages, options);
  }

  public async analyzeEmotions(
    messages: Message[]
  ): Promise<{
    overall: string;
    individual: Map<string, string>;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    return this.emotionAnalysis.analyze(messages);
  }

  public async extractActionItems(
    messages: Message[]
  ): Promise<
    Array<{
      task: string;
      assignee?: string;
      deadline?: Date;
      priority: 'high' | 'medium' | 'low';
    }>
  > {
    return this.actionExtractor.extract(messages);
  }

  public async getProductivityScore(
    userId: string,
    timeRange?: {start: Date; end: Date}
  ): Promise<{
    score: number;
    insights: string[];
    recommendations: string[];
  }> {
    return this.productivityInsights.calculateScore(userId, timeRange);
  }

  // Code Assistant
  public async reviewCode(
    code: string,
    language: string
  ): Promise<{
    issues: Array<{line: number; severity: string; message: string}>;
    suggestions: string[];
    score: number;
  }> {
    if (!this.personalAssistant) {
      throw new Error('Assistant not initialized');
    }
    return this.personalAssistant.reviewCode(code, language);
  }

  // Workflow Automation
  public async createWorkflow(
    trigger: string,
    actions: any[]
  ): Promise<string> {
    // Workflow creation logic
    return 'workflow_id';
  }

  // Privacy & Settings
  public async updatePrivacyMode(mode: 'strict' | 'balanced' | 'performance'): Promise<void> {
    this.config.privacyMode = mode;
    await AsyncStorage.setItem('ai_config', JSON.stringify(this.config));
    
    // Reconfigure assistants with new privacy settings
    if (this.personalAssistant) {
      await this.personalAssistant.updateConfig(this.config);
    }
    if (this.teamAssistant) {
      await this.teamAssistant.updateConfig(this.config);
    }
  }

  public async clearAICache(): Promise<void> {
    await AsyncStorage.removeItem('ai_cache');
    await this.modelLoader.clearCache();
  }

  public async getUsageStatistics(): Promise<{
    tokensUsed: number;
    requestsCount: number;
    averageResponseTime: number;
    mostUsedFeatures: string[];
  }> {
    return this.tokenManager.getStatistics();
  }

  // Offline Mode
  public async enableOfflineMode(): Promise<void> {
    this.config.enableCloudProcessing = false;
    this.config.enableLocalProcessing = true;
    this.config.preferredProvider = 'local';
    
    // Download required models for offline use
    await this.modelLoader.downloadOfflineModels([
      'sentiment-analysis-lite',
      'text-summarization-lite',
      'action-extraction-lite'
    ]);
  }

  public async disableOfflineMode(): Promise<void> {
    this.config.enableCloudProcessing = true;
    // Optionally keep local processing enabled for hybrid mode
  }

  // Model Management
  public async downloadModel(modelName: string): Promise<void> {
    await this.modelLoader.downloadModel(modelName);
  }

  public async listAvailableModels(): Promise<
    Array<{
      name: string;
      size: number;
      type: string;
      downloaded: boolean;
    }>
  > {
    return this.modelLoader.listModels();
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    if (this.personalAssistant) {
      await this.personalAssistant.cleanup();
    }
    if (this.teamAssistant) {
      await this.teamAssistant.cleanup();
    }
    await this.modelLoader.cleanup();
    this.isInitialized = false;
  }
}

export default AIManager;
