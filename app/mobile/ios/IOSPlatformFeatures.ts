// IOSPlatformFeatures.ts - iOS-specific platform features for METR
import {Platform, NativeModules, NativeEventEmitter, DeviceEventEmitter} from 'react-native';

interface IOSShortcut {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
  keywords?: string[];
}

interface IOSWidget {
  id: string;
  name: string;
  description: string;
  data: any;
  updateInterval: number;
}

interface AppClip {
  id: string;
  url: string;
  title: string;
  description: string;
}

export class IOSPlatformFeatures {
  private static instance: IOSPlatformFeatures;
  private shortcuts: Map<string, IOSShortcut> = new Map();
  private widgets: Map<string, IOSWidget> = new Map();
  private appClips: Map<string, AppClip> = new Map();
  private eventEmitter: NativeEventEmitter;

  private constructor() {
    // Initialize native module event emitter
    // this.eventEmitter = new NativeEventEmitter(NativeModules.IOSPlatformModule);
    this.setupEventListeners();
  }

  public static getInstance(): IOSPlatformFeatures {
    if (!IOSPlatformFeatures.instance) {
      IOSPlatformFeatures.instance = new IOSPlatformFeatures();
    }
    return IOSPlatformFeatures.instance;
  }

  private setupEventListeners(): void {
    // Listen for iOS-specific events
    DeviceEventEmitter.addListener('ios_shortcut_triggered', (shortcutId: string) => {
      this.handleShortcutTrigger(shortcutId);
    });

    DeviceEventEmitter.addListener('ios_widget_interaction', (data: any) => {
      this.handleWidgetInteraction(data);
    });

    DeviceEventEmitter.addListener('ios_app_clip_launched', (appClip: AppClip) => {
      this.handleAppClipLaunch(appClip);
    });
  }

  // iOS Shortcuts Integration
  public async addShortcut(shortcut: IOSShortcut): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.warn('iOS Shortcuts are only available on iOS');
      return;
    }

    this.shortcuts.set(shortcut.id, shortcut);

    // Register with iOS Shortcuts app
    // In production, would use native module
    // NativeModules.IOSPlatformModule.registerShortcut(shortcut);

    DeviceEventEmitter.emit('ios_shortcut_registered', shortcut);
  }

  public async removeShortcut(shortcutId: string): Promise<void> {
    this.shortcuts.delete(shortcutId);

    // Unregister from iOS Shortcuts app
    // NativeModules.IOSPlatformModule.unregisterShortcut(shortcutId);
  }

  public getShortcuts(): IOSShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  private handleShortcutTrigger(shortcutId: string): void {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut) {
      shortcut.action();
      DeviceEventEmitter.emit('ios_shortcut_executed', shortcutId);
    }
  }

  // Predefined shortcuts for METR
  public async setupDefaultShortcuts(): Promise<void> {
    // Quick Message
    await this.addShortcut({
      id: 'quick_message',
      title: 'Send Quick Message',
      subtitle: 'Compose a message in METR',
      icon: 'message',
      keywords: ['message', 'chat', 'send'],
      action: () => {
        DeviceEventEmitter.emit('navigate', {screen: 'ComposeMessage'});
      },
    });

    // Start Meeting
    await this.addShortcut({
      id: 'start_meeting',
      title: 'Start Meeting',
      subtitle: 'Start a new meeting',
      icon: 'video',
      keywords: ['meeting', 'call', 'video'],
      action: () => {
        DeviceEventEmitter.emit('navigate', {screen: 'StartMeeting'});
      },
    });

    // Create Task
    await this.addShortcut({
      id: 'create_task',
      title: 'Create Task',
      subtitle: 'Add a new task',
      icon: 'checkmark.circle',
      keywords: ['task', 'todo', 'create'],
      action: () => {
        DeviceEventEmitter.emit('navigate', {screen: 'CreateTask'});
      },
    });

    // AI Assistant
    await this.addShortcut({
      id: 'ai_assistant',
      title: 'Open AI Assistant',
      subtitle: 'Chat with METR AI',
      icon: 'brain',
      keywords: ['ai', 'assistant', 'help'],
      action: () => {
        DeviceEventEmitter.emit('navigate', {screen: 'AIAssistant'});
      },
    });
  }

  // iOS Widgets
  public async registerWidget(widget: IOSWidget): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.warn('iOS Widgets are only available on iOS');
      return;
    }

    this.widgets.set(widget.id, widget);

    // Register widget with iOS
    // NativeModules.IOSPlatformModule.registerWidget(widget);

    DeviceEventEmitter.emit('ios_widget_registered', widget);
  }

  public async updateWidget(widgetId: string, data: any): Promise<void> {
    const widget = this.widgets.get(widgetId);
    if (!widget) return;

    widget.data = data;

    // Update widget in iOS
    // NativeModules.IOSPlatformModule.updateWidget(widgetId, data);
  }

  public getWidgets(): IOSWidget[] {
    return Array.from(this.widgets.values());
  }

  private handleWidgetInteraction(data: any): void {
    const widget = this.widgets.get(data.widgetId);
    if (widget) {
      DeviceEventEmitter.emit('ios_widget_tapped', data);
    }
  }

  // Predefined widgets for METR
  public async setupDefaultWidgets(): Promise<void> {
    // Team Activity Widget
    await this.registerWidget({
      id: 'team_activity',
      name: 'Team Activity',
      description: 'See recent team activity',
      data: {activities: []},
      updateInterval: 300, // 5 minutes
    });

    // Task List Widget
    await this.registerWidget({
      id: 'task_list',
      name: 'My Tasks',
      description: 'Quick view of your tasks',
      data: {tasks: []},
      updateInterval: 600, // 10 minutes
    });

    // Team Sentiment Widget
    await this.registerWidget({
      id: 'team_sentiment',
      name: 'Team Mood',
      description: 'Current team sentiment',
      data: {sentiment: 0},
      updateInterval: 1800, // 30 minutes
    });
  }

  // iOS App Clips
  public async registerAppClip(appClip: AppClip): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.warn('App Clips are only available on iOS');
      return;
    }

    this.appClips.set(appClip.id, appClip);

    // Register App Clip with iOS
    // NativeModules.IOSPlatformModule.registerAppClip(appClip);
  }

  public getAppClips(): AppClip[] {
    return Array.from(this.appClips.values());
  }

  private handleAppClipLaunch(appClip: AppClip): void {
    DeviceEventEmitter.emit('ios_app_clip_launched', appClip);
  }

  // Predefined App Clips
  public async setupDefaultAppClips(): Promise<void> {
    // Quick Join Meeting App Clip
    await this.registerAppClip({
      id: 'quick_join_meeting',
      url: 'metr://meeting/join',
      title: 'Join Meeting',
      description: 'Quickly join a METR meeting',
    });

    // View Message App Clip
    await this.registerAppClip({
      id: 'view_message',
      url: 'metr://message/view',
      title: 'View Message',
      description: 'View a METR message',
    });
  }

  // Initialize all iOS features
  public async initialize(): Promise<void> {
    await this.setupDefaultShortcuts();
    await this.setupDefaultWidgets();
    await this.setupDefaultAppClips();
  }
}

export default IOSPlatformFeatures;

