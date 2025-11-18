// AdaptiveUI.ts - Adaptive UI System for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dimensions, DeviceEventEmitter} from 'react-native';

interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  colorScheme: 'light' | 'dark' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  layout: 'default' | 'simplified' | 'advanced';
}

interface UserBehavior {
  mostUsedFeatures: string[];
  navigationPattern: string[];
  averageSessionDuration: number;
  preferredWidgets: string[];
  interactionSpeed: 'slow' | 'normal' | 'fast';
  expertise: 'beginner' | 'intermediate' | 'expert';
}

interface AdaptiveLayout {
  componentOrder: string[];
  hiddenComponents: string[];
  shortcuts: Shortcut[];
  quickActions: QuickAction[];
  recommendations: string[];
}

interface Shortcut {
  id: string;
  icon: string;
  action: string;
  position: {x: number; y: number};
  frequency: number;
}

interface QuickAction {
  id: string;
  label: string;
  action: string;
  context: string;
}

interface ContextualUI {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  location: 'home' | 'office' | 'commute' | 'travel';
  activity: 'working' | 'meeting' | 'break' | 'focus';
  device: 'phone' | 'tablet' | 'desktop';
}

export class AdaptiveUI {
  private static instance: AdaptiveUI;
  private userPreferences: UserPreferences;
  private userBehavior: UserBehavior;
  private adaptiveLayout: AdaptiveLayout;
  private contextualUI: ContextualUI;
  private learningData: Map<string, any> = new Map();
  private adaptationHistory: any[] = [];
  
  private constructor() {
    this.userPreferences = this.getDefaultPreferences();
    this.userBehavior = this.getDefaultBehavior();
    this.adaptiveLayout = this.getDefaultLayout();
    this.contextualUI = this.getCurrentContext();
    this.initialize();
  }

  public static getInstance(): AdaptiveUI {
    if (!AdaptiveUI.instance) {
      AdaptiveUI.instance = new AdaptiveUI();
    }
    return AdaptiveUI.instance;
  }

  private async initialize() {
    await this.loadUserData();
    this.startLearning();
    this.monitorUserBehavior();
    this.adaptToContext();
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      fontSize: 'medium',
      colorScheme: 'auto',
      density: 'comfortable',
      animations: true,
      reducedMotion: false,
      highContrast: false,
      layout: 'default',
    };
  }

  private getDefaultBehavior(): UserBehavior {
    return {
      mostUsedFeatures: [],
      navigationPattern: [],
      averageSessionDuration: 0,
      preferredWidgets: [],
      interactionSpeed: 'normal',
      expertise: 'beginner',
    };
  }

  private getDefaultLayout(): AdaptiveLayout {
    return {
      componentOrder: ['home', 'messages', 'tasks', 'analytics', 'settings'],
      hiddenComponents: [],
      shortcuts: [],
      quickActions: [],
      recommendations: [],
    };
  }

  private getCurrentContext(): ContextualUI {
    const hour = new Date().getHours();
    let timeOfDay: ContextualUI['timeOfDay'] = 'morning';
    
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 5) timeOfDay = 'night';

    const {width} = Dimensions.get('window');
    const device: ContextualUI['device'] = width < 400 ? 'phone' : width < 768 ? 'tablet' : 'desktop';

    return {
      timeOfDay,
      location: 'office', // Would use GPS in production
      activity: 'working',
      device,
    };
  }

  // Learning and Adaptation
  private startLearning() {
    DeviceEventEmitter.addListener('user_interaction', this.learnFromInteraction.bind(this));
    DeviceEventEmitter.addListener('feature_used', this.trackFeatureUsage.bind(this));
    DeviceEventEmitter.addListener('navigation', this.trackNavigation.bind(this));
  }

  private learnFromInteraction(event: any) {
    const {type, target, duration, success} = event;
    
    // Update interaction speed
    if (duration < 500) {
      this.updateInteractionSpeed('fast');
    } else if (duration > 2000) {
      this.updateInteractionSpeed('slow');
    }

    // Learn from errors
    if (!success) {
      this.suggestSimplification(target);
    }

    // Update expertise level
    this.updateExpertiseLevel(event);
  }

  private trackFeatureUsage(feature: string) {
    const usage = this.learningData.get('featureUsage') || {};
    usage[feature] = (usage[feature] || 0) + 1;
    this.learningData.set('featureUsage', usage);

    // Update most used features
    this.updateMostUsedFeatures();
  }

  private trackNavigation(path: string) {
    const pattern = this.userBehavior.navigationPattern;
    pattern.push(path);
    
    // Keep last 100 navigations
    if (pattern.length > 100) {
      pattern.shift();
    }

    // Analyze patterns
    this.analyzeNavigationPatterns();
  }

  private updateInteractionSpeed(speed: UserBehavior['interactionSpeed']) {
    const speeds = this.learningData.get('speeds') || [];
    speeds.push(speed);
    
    if (speeds.length > 50) {
      const fast = speeds.filter((s: string) => s === 'fast').length;
      const slow = speeds.filter((s: string) => s === 'slow').length;
      
      if (fast > 30) this.userBehavior.interactionSpeed = 'fast';
      else if (slow > 30) this.userBehavior.interactionSpeed = 'slow';
    }
  }

  private updateExpertiseLevel(interaction: any) {
    const expertise = this.learningData.get('expertise') || {
      advancedFeatures: 0,
      shortcuts: 0,
      errors: 0,
    };

    if (interaction.advanced) expertise.advancedFeatures++;
    if (interaction.shortcut) expertise.shortcuts++;
    if (!interaction.success) expertise.errors++;

    if (expertise.advancedFeatures > 100 && expertise.shortcuts > 50) {
      this.userBehavior.expertise = 'expert';
    } else if (expertise.errors > 50) {
      this.userBehavior.expertise = 'beginner';
    } else {
      this.userBehavior.expertise = 'intermediate';
    }

    this.learningData.set('expertise', expertise);
  }

  private updateMostUsedFeatures() {
    const usage = this.learningData.get('featureUsage') || {};
    const sorted = Object.entries(usage)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10)
      .map(([feature]) => feature);
    
    this.userBehavior.mostUsedFeatures = sorted;
    this.reorganizeUI();
  }

  private analyzeNavigationPatterns() {
    const pattern = this.userBehavior.navigationPattern;
    const sequences: Map<string, number> = new Map();
    
    // Find common sequences
    for (let i = 0; i < pattern.length - 2; i++) {
      const sequence = `${pattern[i]}->${pattern[i + 1]}->${pattern[i + 2]}`;
      sequences.set(sequence, (sequences.get(sequence) || 0) + 1);
    }

    // Create shortcuts for common sequences
    const commonSequences = Array.from(sequences.entries())
      .filter(([, count]) => count > 5)
      .sort((a, b) => b[1] - a[1]);

    commonSequences.forEach(([sequence], index) => {
      if (index < 5) {
        this.createShortcut(sequence);
      }
    });
  }

  // UI Adaptation
  private reorganizeUI() {
    const {mostUsedFeatures} = this.userBehavior;
    
    // Reorder components based on usage
    const newOrder = [
      ...mostUsedFeatures.slice(0, 3),
      ...this.adaptiveLayout.componentOrder.filter(c => !mostUsedFeatures.includes(c)),
    ];

    this.adaptiveLayout.componentOrder = newOrder;
    
    // Hide rarely used components
    const usage = this.learningData.get('featureUsage') || {};
    const rarelyUsed = Object.entries(usage)
      .filter(([, count]) => (count as number) < 5)
      .map(([feature]) => feature);
    
    this.adaptiveLayout.hiddenComponents = rarelyUsed;

    DeviceEventEmitter.emit('ui_reorganized', this.adaptiveLayout);
  }

  private createShortcut(sequence: string) {
    const shortcut: Shortcut = {
      id: `shortcut_${Date.now()}`,
      icon: 'lightning-bolt',
      action: sequence,
      position: this.calculateOptimalPosition(),
      frequency: 0,
    };

    this.adaptiveLayout.shortcuts.push(shortcut);
    DeviceEventEmitter.emit('shortcut_created', shortcut);
  }

  private calculateOptimalPosition(): {x: number; y: number} {
    // Calculate based on thumb reachability
    const {width, height} = Dimensions.get('window');
    const isRightHanded = this.learningData.get('handedness') || 'right';
    
    return {
      x: isRightHanded === 'right' ? width - 80 : 80,
      y: height - 150,
    };
  }

  private suggestSimplification(target: string) {
    const suggestion = `Consider simplifying ${target}`;
    this.adaptiveLayout.recommendations.push(suggestion);
    
    if (this.userBehavior.expertise === 'beginner') {
      this.switchToSimplifiedLayout();
    }
  }

  private switchToSimplifiedLayout() {
    this.userPreferences.layout = 'simplified';
    this.userPreferences.density = 'spacious';
    this.userPreferences.fontSize = 'large';
    
    DeviceEventEmitter.emit('layout_changed', 'simplified');
  }

  // Context Adaptation
  private adaptToContext() {
    setInterval(() => {
      this.contextualUI = this.getCurrentContext();
      this.applyContextualAdaptations();
    }, 60000); // Check every minute
  }

  private applyContextualAdaptations() {
    const {timeOfDay, location, activity, device} = this.contextualUI;
    
    // Time-based adaptations
    switch (timeOfDay) {
      case 'night':
        this.enableNightMode();
        break;
      case 'morning':
        this.showMorningDashboard();
        break;
    }

    // Location-based adaptations
    switch (location) {
      case 'commute':
        this.enableOneHandedMode();
        break;
      case 'office':
        this.showProductivityTools();
        break;
    }

    // Activity-based adaptations
    switch (activity) {
      case 'focus':
        this.enableFocusMode();
        break;
      case 'meeting':
        this.showMeetingTools();
        break;
    }

    // Device-based adaptations
    switch (device) {
      case 'phone':
        this.optimizeForPhone();
        break;
      case 'tablet':
        this.optimizeForTablet();
        break;
      case 'desktop':
        this.optimizeForDesktop();
        break;
    }
  }

  private enableNightMode() {
    if (this.userPreferences.colorScheme === 'auto') {
      DeviceEventEmitter.emit('theme_change', 'dark');
      this.userPreferences.reducedMotion = true;
    }
  }

  private showMorningDashboard() {
    const quickActions: QuickAction[] = [
      {id: 'daily_standup', label: 'Start Daily', action: 'start_standup', context: 'morning'},
      {id: 'check_tasks', label: 'Today\'s Tasks', action: 'show_tasks', context: 'morning'},
      {id: 'team_status', label: 'Team Status', action: 'show_team', context: 'morning'},
    ];
    
    this.adaptiveLayout.quickActions = quickActions;
    DeviceEventEmitter.emit('quick_actions_updated', quickActions);
  }

  private enableOneHandedMode() {
    DeviceEventEmitter.emit('layout_mode', 'one_handed');
    
    // Move controls to bottom
    this.adaptiveLayout.componentOrder = this.adaptiveLayout.componentOrder.reverse();
  }

  private showProductivityTools() {
    const tools = ['tasks', 'analytics', 'calendar', 'timer'];
    this.prioritizeComponents(tools);
  }

  private enableFocusMode() {
    DeviceEventEmitter.emit('focus_mode', true);
    
    // Hide distracting elements
    this.adaptiveLayout.hiddenComponents = ['social', 'notifications', 'news'];
  }

  private showMeetingTools() {
    const tools = ['video', 'screen_share', 'notes', 'timer'];
    this.prioritizeComponents(tools);
  }

  private optimizeForPhone() {
    this.userPreferences.density = 'compact';
    this.userPreferences.fontSize = 'medium';
    DeviceEventEmitter.emit('layout_optimized', 'phone');
  }

  private optimizeForTablet() {
    this.userPreferences.density = 'comfortable';
    DeviceEventEmitter.emit('layout_optimized', 'tablet');
  }

  private optimizeForDesktop() {
    this.userPreferences.density = 'spacious';
    this.userPreferences.layout = 'advanced';
    DeviceEventEmitter.emit('layout_optimized', 'desktop');
  }

  private prioritizeComponents(components: string[]) {
    const currentOrder = this.adaptiveLayout.componentOrder;
    const prioritized = [
      ...components,
      ...currentOrder.filter(c => !components.includes(c)),
    ];
    this.adaptiveLayout.componentOrder = prioritized;
  }

  // Accessibility adaptations
  public enableAccessibility(type: 'vision' | 'motor' | 'cognitive') {
    switch (type) {
      case 'vision':
        this.userPreferences.fontSize = 'xlarge';
        this.userPreferences.highContrast = true;
        break;
      case 'motor':
        this.userPreferences.density = 'spacious';
        this.userPreferences.reducedMotion = true;
        break;
      case 'cognitive':
        this.userPreferences.layout = 'simplified';
        this.userPreferences.animations = false;
        break;
    }
    
    this.savePreferences();
  }

  // Persistence
  private async loadUserData() {
    try {
      const preferences = await AsyncStorage.getItem('adaptive_preferences');
      const behavior = await AsyncStorage.getItem('adaptive_behavior');
      const layout = await AsyncStorage.getItem('adaptive_layout');
      
      if (preferences) this.userPreferences = JSON.parse(preferences);
      if (behavior) this.userBehavior = JSON.parse(behavior);
      if (layout) this.adaptiveLayout = JSON.parse(layout);
    } catch (error) {
      console.error('Failed to load adaptive data:', error);
    }
  }

  private async savePreferences() {
    try {
      await AsyncStorage.setItem('adaptive_preferences', JSON.stringify(this.userPreferences));
      await AsyncStorage.setItem('adaptive_behavior', JSON.stringify(this.userBehavior));
      await AsyncStorage.setItem('adaptive_layout', JSON.stringify(this.adaptiveLayout));
    } catch (error) {
      console.error('Failed to save adaptive data:', error);
    }
  }

  // Monitoring
  private monitorUserBehavior() {
    // Track session duration
    const sessionStart = Date.now();
    
    setInterval(() => {
      const duration = Date.now() - sessionStart;
      this.userBehavior.averageSessionDuration = duration / 1000 / 60; // minutes
    }, 60000);
  }

  // Public API
  public getPreferences(): UserPreferences {
    return this.userPreferences;
  }

  public getBehavior(): UserBehavior {
    return this.userBehavior;
  }

  public getLayout(): AdaptiveLayout {
    return this.adaptiveLayout;
  }

  public getContext(): ContextualUI {
    return this.contextualUI;
  }

  public setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.userPreferences[key] = value;
    this.savePreferences();
    DeviceEventEmitter.emit('preference_changed', {key, value});
  }

  public resetAdaptations(): void {
    this.userPreferences = this.getDefaultPreferences();
    this.userBehavior = this.getDefaultBehavior();
    this.adaptiveLayout = this.getDefaultLayout();
    this.learningData.clear();
    this.savePreferences();
  }

  public getRecommendations(): string[] {
    return this.adaptiveLayout.recommendations;
  }

  public applyRecommendation(index: number): void {
    const recommendation = this.adaptiveLayout.recommendations[index];
    // Apply the recommendation
    DeviceEventEmitter.emit('recommendation_applied', recommendation);
  }
}
