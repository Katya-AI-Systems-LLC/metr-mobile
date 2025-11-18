// AndroidPlatformFeatures.ts - Android-specific platform features for METR
import {Platform, NativeModules, NativeEventEmitter, DeviceEventEmitter} from 'react-native';

interface QuickSetting {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  enabled: boolean;
}

interface Bubble {
  id: string;
  title: string;
  icon: string;
  content: any;
  actions: BubbleAction[];
}

interface BubbleAction {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
}

export class AndroidPlatformFeatures {
  private static instance: AndroidPlatformFeatures;
  private quickSettings: Map<string, QuickSetting> = new Map();
  private bubbles: Map<string, Bubble> = new Map();
  private eventEmitter: NativeEventEmitter;

  private constructor() {
    // Initialize native module event emitter
    // this.eventEmitter = new NativeEventEmitter(NativeModules.AndroidPlatformModule);
    this.setupEventListeners();
  }

  public static getInstance(): AndroidPlatformFeatures {
    if (!AndroidPlatformFeatures.instance) {
      AndroidPlatformFeatures.instance = new AndroidPlatformFeatures();
    }
    return AndroidPlatformFeatures.instance;
  }

  private setupEventListeners(): void {
    // Listen for Android-specific events
    DeviceEventEmitter.addListener('android_quick_setting_tapped', (settingId: string) => {
      this.handleQuickSettingTap(settingId);
    });

    DeviceEventEmitter.addListener('android_bubble_interaction', (data: any) => {
      this.handleBubbleInteraction(data);
    });
  }

  // Android Material You Theming
  public async applyMaterialYouTheme(): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Material You is only available on Android');
      return;
    }

    // Get system color scheme
    // const systemColors = await NativeModules.AndroidPlatformModule.getSystemColors();
    
    // Apply Material You colors
    DeviceEventEmitter.emit('material_you_theme_applied', {
      primary: '#8B5CF6', // METR purple
      secondary: '#14B8A6', // METR teal
    });
  }

  // Android Quick Settings
  public async addQuickSetting(setting: QuickSetting): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Quick Settings are only available on Android');
      return;
    }

    this.quickSettings.set(setting.id, setting);

    // Register with Android Quick Settings
    // NativeModules.AndroidPlatformModule.registerQuickSetting(setting);

    DeviceEventEmitter.emit('android_quick_setting_registered', setting);
  }

  public async removeQuickSetting(settingId: string): Promise<void> {
    this.quickSettings.delete(settingId);

    // Unregister from Android Quick Settings
    // NativeModules.AndroidPlatformModule.unregisterQuickSetting(settingId);
  }

  public getQuickSettings(): QuickSetting[] {
    return Array.from(this.quickSettings.values());
  }

  private handleQuickSettingTap(settingId: string): void {
    const setting = this.quickSettings.get(settingId);
    if (setting && setting.enabled) {
      setting.action();
      DeviceEventEmitter.emit('android_quick_setting_executed', settingId);
    }
  }

  // Predefined Quick Settings for METR
  public async setupDefaultQuickSettings(): Promise<void> {
    // Do Not Disturb
    await this.addQuickSetting({
      id: 'do_not_disturb',
      label: 'Do Not Disturb',
      icon: 'notifications_off',
      enabled: false,
      action: () => {
        DeviceEventEmitter.emit('toggle_do_not_disturb');
      },
    });

    // Quick Message
    await this.addQuickSetting({
      id: 'quick_message',
      label: 'Quick Message',
      icon: 'message',
      enabled: true,
      action: () => {
        DeviceEventEmitter.emit('navigate', {screen: 'ComposeMessage'});
      },
    });

    // Start Meeting
    await this.addQuickSetting({
      id: 'start_meeting',
      label: 'Start Meeting',
      icon: 'video_call',
      enabled: true,
      action: () => {
        DeviceEventEmitter.emit('navigate', {screen: 'StartMeeting'});
      },
    });

    // AI Assistant
    await this.addQuickSetting({
      id: 'ai_assistant',
      label: 'AI Assistant',
      icon: 'smart_toy',
      enabled: true,
      action: () => {
        DeviceEventEmitter.emit('navigate', {screen: 'AIAssistant'});
      },
    });
  }

  // Android Bubbles API
  public async showBubble(bubble: Bubble): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Bubbles are only available on Android');
      return;
    }

    this.bubbles.set(bubble.id, bubble);

    // Show bubble using Android Bubbles API
    // NativeModules.AndroidPlatformModule.showBubble(bubble);

    DeviceEventEmitter.emit('android_bubble_shown', bubble);
  }

  public async dismissBubble(bubbleId: string): Promise<void> {
    const bubble = this.bubbles.get(bubbleId);
    if (!bubble) return;

    this.bubbles.delete(bubbleId);

    // Dismiss bubble
    // NativeModules.AndroidPlatformModule.dismissBubble(bubbleId);
  }

  public getBubbles(): Bubble[] {
    return Array.from(this.bubbles.values());
  }

  private handleBubbleInteraction(data: any): void {
    const bubble = this.bubbles.get(data.bubbleId);
    if (bubble) {
      if (data.actionId) {
        const action = bubble.actions.find(a => a.id === data.actionId);
        if (action) {
          action.action();
        }
      }
      DeviceEventEmitter.emit('android_bubble_tapped', data);
    }
  }

  // Predefined bubbles for METR
  public async showMessageBubble(messageId: string, content: string): Promise<void> {
    await this.showBubble({
      id: `message_${messageId}`,
      title: 'New Message',
      icon: 'message',
      content: {messageId, preview: content},
      actions: [
        {
          id: 'reply',
          label: 'Reply',
          icon: 'reply',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'ReplyMessage', params: {messageId}});
          },
        },
        {
          id: 'dismiss',
          label: 'Dismiss',
          action: () => {
            this.dismissBubble(`message_${messageId}`);
          },
        },
      ],
    });
  }

  public async showMeetingBubble(meetingId: string, title: string): Promise<void> {
    await this.showBubble({
      id: `meeting_${meetingId}`,
      title: 'Meeting',
      icon: 'video_call',
      content: {meetingId, title},
      actions: [
        {
          id: 'join',
          label: 'Join',
          icon: 'call',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'JoinMeeting', params: {meetingId}});
          },
        },
        {
          id: 'dismiss',
          label: 'Dismiss',
          action: () => {
            this.dismissBubble(`meeting_${meetingId}`);
          },
        },
      ],
    });
  }

  // Initialize all Android features
  public async initialize(): Promise<void> {
    await this.applyMaterialYouTheme();
    await this.setupDefaultQuickSettings();
  }
}

export default AndroidPlatformFeatures;

