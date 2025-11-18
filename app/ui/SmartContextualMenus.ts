// SmartContextualMenus.ts - Intelligent Context-Aware Menus for METR
import {DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: string;
  shortcut?: string;
  submenu?: MenuItem[];
  enabled: boolean;
  visible: boolean;
  priority: number;
  context: string[];
  frequency: number;
}

interface ContextualMenu {
  id: string;
  context: MenuContext;
  items: MenuItem[];
  position: MenuPosition;
  style: MenuStyle;
  predictions: MenuPrediction[];
}

interface MenuContext {
  selection?: string;
  target?: string;
  location: string;
  user: string;
  time: Date;
  recentActions: string[];
  currentTask?: string;
  permissions: string[];
}

interface MenuPosition {
  x: number;
  y: number;
  anchor: 'cursor' | 'selection' | 'element' | 'center';
  alignment: 'left' | 'right' | 'center';
}

interface MenuStyle {
  theme: 'light' | 'dark' | 'auto';
  size: 'compact' | 'normal' | 'large';
  animation: 'fade' | 'slide' | 'scale' | 'none';
  transparency: number;
}

interface MenuPrediction {
  action: string;
  probability: number;
  reason: string;
}

interface UsagePattern {
  sequence: string[];
  frequency: number;
  context: string;
  timestamp: Date;
}

export class SmartContextualMenus {
  private static instance: SmartContextualMenus;
  private menuRegistry: Map<string, MenuItem[]> = new Map();
  private activeMenu: ContextualMenu | null = null;
  private usageHistory: UsagePattern[] = [];
  private predictions: Map<string, MenuPrediction[]> = new Map();
  private contextCache: Map<string, MenuContext> = new Map();
  private aiModel: MenuAI;
  
  private constructor() {
    this.aiModel = new MenuAI();
    this.initialize();
  }

  public static getInstance(): SmartContextualMenus {
    if (!SmartContextualMenus.instance) {
      SmartContextualMenus.instance = new SmartContextualMenus();
    }
    return SmartContextualMenus.instance;
  }

  private async initialize() {
    await this.loadMenuConfigurations();
    await this.loadUsageHistory();
    this.setupEventListeners();
    this.trainPredictionModel();
  }

  private setupEventListeners() {
    DeviceEventEmitter.addListener('context_menu_request', this.handleMenuRequest.bind(this));
    DeviceEventEmitter.addListener('selection_changed', this.updateContext.bind(this));
    DeviceEventEmitter.addListener('menu_item_selected', this.recordUsage.bind(this));
  }

  // Menu Generation
  public async generateMenu(context: MenuContext): Promise<ContextualMenu> {
    // Get base menu items for context
    const baseItems = this.getBaseMenuItems(context);
    
    // Apply AI predictions
    const predictions = await this.aiModel.predictActions(context);
    
    // Filter and sort items based on context
    const filteredItems = this.filterByContext(baseItems, context);
    const prioritizedItems = this.prioritizeItems(filteredItems, predictions);
    
    // Add dynamic items
    const dynamicItems = this.generateDynamicItems(context);
    const allItems = [...prioritizedItems, ...dynamicItems];
    
    // Group similar items
    const groupedItems = this.groupItems(allItems);
    
    // Create menu
    const menu: ContextualMenu = {
      id: `menu_${Date.now()}`,
      context,
      items: groupedItems,
      position: this.calculateOptimalPosition(context),
      style: this.getMenuStyle(context),
      predictions,
    };
    
    this.activeMenu = menu;
    this.cacheContext(context);
    
    return menu;
  }

  private getBaseMenuItems(context: MenuContext): MenuItem[] {
    const contextKey = this.getContextKey(context);
    let items = this.menuRegistry.get(contextKey) || [];
    
    // Get default items if no specific context items
    if (items.length === 0) {
      items = this.getDefaultMenuItems();
    }
    
    return items.map(item => ({...item})); // Clone items
  }

  private filterByContext(items: MenuItem[], context: MenuContext): MenuItem[] {
    return items.filter(item => {
      // Check permissions
      if (item.context.includes('admin') && !context.permissions.includes('admin')) {
        return false;
      }
      
      // Check selection context
      if (item.context.includes('text') && !context.selection) {
        return false;
      }
      
      // Check target context
      if (item.context.includes('image') && context.target !== 'image') {
        return false;
      }
      
      return item.visible;
    });
  }

  private prioritizeItems(items: MenuItem[], predictions: MenuPrediction[]): MenuItem[] {
    // Create priority map from predictions
    const priorityMap = new Map<string, number>();
    predictions.forEach((pred, index) => {
      priorityMap.set(pred.action, 100 - index * 10);
    });
    
    // Sort items by priority
    return items.sort((a, b) => {
      const aPriority = priorityMap.get(a.action) || a.priority;
      const bPriority = priorityMap.get(b.action) || b.priority;
      
      // Also consider frequency
      const aScore = aPriority + a.frequency * 0.1;
      const bScore = bPriority + b.frequency * 0.1;
      
      return bScore - aScore;
    });
  }

  private generateDynamicItems(context: MenuContext): MenuItem[] {
    const dynamicItems: MenuItem[] = [];
    
    // Recent actions
    if (context.recentActions.length > 0) {
      const recentAction = context.recentActions[0];
      dynamicItems.push({
        id: 'repeat_last',
        label: `Repeat: ${recentAction}`,
        icon: 'refresh',
        action: recentAction,
        enabled: true,
        visible: true,
        priority: 90,
        context: ['recent'],
        frequency: 0,
      });
    }
    
    // Clipboard actions
    if (context.selection) {
      dynamicItems.push({
        id: 'smart_copy',
        label: 'Smart Copy',
        icon: 'content-copy',
        action: 'smart_copy',
        shortcut: 'Ctrl+Shift+C',
        enabled: true,
        visible: true,
        priority: 85,
        context: ['selection'],
        frequency: 0,
      });
    }
    
    // Task-specific actions
    if (context.currentTask) {
      const taskActions = this.getTaskSpecificActions(context.currentTask);
      dynamicItems.push(...taskActions);
    }
    
    // Time-based actions
    const timeActions = this.getTimeBasedActions(context.time);
    dynamicItems.push(...timeActions);
    
    return dynamicItems;
  }

  private getTaskSpecificActions(task: string): MenuItem[] {
    const actions: MenuItem[] = [];
    
    switch (task) {
      case 'coding':
        actions.push(
          {
            id: 'run_code',
            label: 'Run Code',
            icon: 'play',
            action: 'run_code',
            shortcut: 'F5',
            enabled: true,
            visible: true,
            priority: 95,
            context: ['code'],
            frequency: 0,
          },
          {
            id: 'debug',
            label: 'Debug',
            icon: 'bug',
            action: 'debug',
            shortcut: 'F9',
            enabled: true,
            visible: true,
            priority: 94,
            context: ['code'],
            frequency: 0,
          }
        );
        break;
        
      case 'writing':
        actions.push(
          {
            id: 'grammar_check',
            label: 'Grammar Check',
            icon: 'spellcheck',
            action: 'grammar_check',
            enabled: true,
            visible: true,
            priority: 93,
            context: ['text'],
            frequency: 0,
          },
          {
            id: 'summarize',
            label: 'Summarize',
            icon: 'summarize',
            action: 'summarize',
            enabled: true,
            visible: true,
            priority: 92,
            context: ['text'],
            frequency: 0,
          }
        );
        break;
    }
    
    return actions;
  }

  private getTimeBasedActions(time: Date): MenuItem[] {
    const actions: MenuItem[] = [];
    const hour = time.getHours();
    
    if (hour >= 11 && hour <= 14) {
      actions.push({
        id: 'lunch_break',
        label: 'Start Lunch Break',
        icon: 'restaurant',
        action: 'start_break',
        enabled: true,
        visible: true,
        priority: 80,
        context: ['time'],
        frequency: 0,
      });
    }
    
    if (hour >= 17) {
      actions.push({
        id: 'end_day',
        label: 'End Day Summary',
        icon: 'event-available',
        action: 'day_summary',
        enabled: true,
        visible: true,
        priority: 81,
        context: ['time'],
        frequency: 0,
      });
    }
    
    return actions;
  }

  private groupItems(items: MenuItem[]): MenuItem[] {
    const groups: Map<string, MenuItem[]> = new Map();
    const ungrouped: MenuItem[] = [];
    
    // Group related items
    items.forEach(item => {
      if (item.context.includes('edit')) {
        const group = groups.get('edit') || [];
        group.push(item);
        groups.set('edit', group);
      } else if (item.context.includes('share')) {
        const group = groups.get('share') || [];
        group.push(item);
        groups.set('share', group);
      } else {
        ungrouped.push(item);
      }
    });
    
    // Create grouped menu structure
    const groupedItems: MenuItem[] = [...ungrouped];
    
    groups.forEach((groupItems, groupName) => {
      if (groupItems.length > 3) {
        groupedItems.push({
          id: `group_${groupName}`,
          label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
          icon: 'folder',
          action: '',
          submenu: groupItems,
          enabled: true,
          visible: true,
          priority: Math.max(...groupItems.map(i => i.priority)),
          context: [groupName],
          frequency: 0,
        });
      } else {
        groupedItems.push(...groupItems);
      }
    });
    
    return groupedItems;
  }

  private calculateOptimalPosition(context: MenuContext): MenuPosition {
    // Calculate position based on context
    const position: MenuPosition = {
      x: 0,
      y: 0,
      anchor: 'cursor',
      alignment: 'left',
    };
    
    if (context.selection) {
      position.anchor = 'selection';
      position.alignment = 'center';
    } else if (context.target) {
      position.anchor = 'element';
      position.alignment = 'right';
    }
    
    return position;
  }

  private getMenuStyle(context: MenuContext): MenuStyle {
    return {
      theme: this.getThemeForTime(context.time),
      size: context.selection ? 'compact' : 'normal',
      animation: 'fade',
      transparency: 0.95,
    };
  }

  private getThemeForTime(time: Date): 'light' | 'dark' | 'auto' {
    const hour = time.getHours();
    if (hour >= 20 || hour < 6) return 'dark';
    return 'light';
  }

  private getContextKey(context: MenuContext): string {
    return `${context.location}_${context.target || 'default'}`;
  }

  private cacheContext(context: MenuContext): void {
    const key = this.getContextKey(context);
    this.contextCache.set(key, context);
    
    // Limit cache size
    if (this.contextCache.size > 100) {
      const firstKey = this.contextCache.keys().next().value;
      this.contextCache.delete(firstKey);
    }
  }

  // Usage Tracking
  private recordUsage(event: any): void {
    const {action, context} = event;
    
    const pattern: UsagePattern = {
      sequence: [...(context.recentActions || []), action].slice(-5),
      frequency: 1,
      context: this.getContextKey(context),
      timestamp: new Date(),
    };
    
    this.usageHistory.push(pattern);
    this.updateItemFrequency(action);
    this.updatePredictions(pattern);
    
    // Persist history
    this.saveUsageHistory();
  }

  private updateItemFrequency(action: string): void {
    this.menuRegistry.forEach(items => {
      const item = items.find(i => i.action === action);
      if (item) {
        item.frequency++;
      }
    });
  }

  private updatePredictions(pattern: UsagePattern): void {
    const key = pattern.sequence.slice(0, -1).join(',');
    const predictions = this.predictions.get(key) || [];
    
    const existing = predictions.find(p => p.action === pattern.sequence[pattern.sequence.length - 1]);
    if (existing) {
      existing.probability = Math.min(1, existing.probability + 0.1);
    } else {
      predictions.push({
        action: pattern.sequence[pattern.sequence.length - 1],
        probability: 0.3,
        reason: 'Based on usage pattern',
      });
    }
    
    this.predictions.set(key, predictions);
  }

  // Machine Learning
  private trainPredictionModel(): void {
    this.aiModel.train(this.usageHistory);
  }

  // Event Handlers
  private async handleMenuRequest(event: any): void {
    const {context} = event;
    const menu = await this.generateMenu(context);
    DeviceEventEmitter.emit('menu_generated', menu);
  }

  private updateContext(event: any): void {
    if (this.activeMenu) {
      this.activeMenu.context = {...this.activeMenu.context, ...event};
      this.regenerateMenu();
    }
  }

  private async regenerateMenu(): Promise<void> {
    if (!this.activeMenu) return;
    
    const newMenu = await this.generateMenu(this.activeMenu.context);
    this.activeMenu = newMenu;
    DeviceEventEmitter.emit('menu_updated', newMenu);
  }

  // Persistence
  private async loadMenuConfigurations(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('menu_configurations');
      if (saved) {
        const configs = JSON.parse(saved);
        Object.entries(configs).forEach(([key, items]) => {
          this.menuRegistry.set(key, items as MenuItem[]);
        });
      } else {
        this.loadDefaultMenus();
      }
    } catch (error) {
      console.error('Failed to load menu configurations:', error);
      this.loadDefaultMenus();
    }
  }

  private loadDefaultMenus(): void {
    // Default menus
    this.menuRegistry.set('default', [
      {id: 'copy', label: 'Copy', icon: 'content-copy', action: 'copy', shortcut: 'Ctrl+C', enabled: true, visible: true, priority: 100, context: ['text'], frequency: 0},
      {id: 'paste', label: 'Paste', icon: 'content-paste', action: 'paste', shortcut: 'Ctrl+V', enabled: true, visible: true, priority: 99, context: ['input'], frequency: 0},
      {id: 'cut', label: 'Cut', icon: 'content-cut', action: 'cut', shortcut: 'Ctrl+X', enabled: true, visible: true, priority: 98, context: ['text'], frequency: 0},
      {id: 'delete', label: 'Delete', icon: 'delete', action: 'delete', shortcut: 'Del', enabled: true, visible: true, priority: 70, context: ['any'], frequency: 0},
    ]);
  }

  private async loadUsageHistory(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('menu_usage_history');
      if (saved) {
        this.usageHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load usage history:', error);
    }
  }

  private async saveUsageHistory(): Promise<void> {
    try {
      // Keep only last 1000 entries
      const historyToSave = this.usageHistory.slice(-1000);
      await AsyncStorage.setItem('menu_usage_history', JSON.stringify(historyToSave));
    } catch (error) {
      console.error('Failed to save usage history:', error);
    }
  }

  // Public API
  public getActiveMenu(): ContextualMenu | null {
    return this.activeMenu;
  }

  public closeMenu(): void {
    this.activeMenu = null;
    DeviceEventEmitter.emit('menu_closed');
  }

  public executeAction(action: string): void {
    DeviceEventEmitter.emit('menu_action_execute', action);
    this.recordUsage({action, context: this.activeMenu?.context});
    this.closeMenu();
  }

  public registerMenuItem(contextKey: string, item: MenuItem): void {
    const items = this.menuRegistry.get(contextKey) || [];
    items.push(item);
    this.menuRegistry.set(contextKey, items);
  }

  public getDefaultMenuItems(): MenuItem[] {
    return this.menuRegistry.get('default') || [];
  }
}

// Menu AI for predictions
class MenuAI {
  private patterns: Map<string, number> = new Map();
  
  train(history: UsagePattern[]): void {
    history.forEach(pattern => {
      const key = pattern.sequence.join(',');
      this.patterns.set(key, (this.patterns.get(key) || 0) + pattern.frequency);
    });
  }
  
  async predictActions(context: MenuContext): Promise<MenuPrediction[]> {
    const predictions: MenuPrediction[] = [];
    const recentKey = context.recentActions.join(',');
    
    // Find matching patterns
    this.patterns.forEach((frequency, pattern) => {
      if (pattern.startsWith(recentKey)) {
        const nextAction = pattern.split(',')[context.recentActions.length];
        if (nextAction) {
          predictions.push({
            action: nextAction,
            probability: Math.min(1, frequency / 100),
            reason: `Frequent pattern (${frequency} times)`,
          });
        }
      }
    });
    
    // Sort by probability
    return predictions.sort((a, b) => b.probability - a.probability).slice(0, 5);
  }
}
