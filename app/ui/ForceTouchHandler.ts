// ForceTouchHandler.ts - 3D Touch / Force Touch support for METR
import {Platform, NativeModules, NativeEventEmitter, DeviceEventEmitter} from 'react-native';

interface ForceTouchAction {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
}

interface ForceTouchPreview {
  id: string;
  view: any; // React component or view config
  actions: ForceTouchAction[];
}

export class ForceTouchHandler {
  private static instance: ForceTouchHandler;
  private previews: Map<string, ForceTouchPreview> = new Map();
  private eventEmitter: NativeEventEmitter;
  private isSupported: boolean = false;

  private constructor() {
    // Initialize native module event emitter
    // this.eventEmitter = new NativeEventEmitter(NativeModules.ForceTouchModule);
    this.checkSupport();
    this.setupEventListeners();
  }

  public static getInstance(): ForceTouchHandler {
    if (!ForceTouchHandler.instance) {
      ForceTouchHandler.instance = new ForceTouchHandler();
    }
    return ForceTouchHandler.instance;
  }

  private async checkSupport(): Promise<void> {
    // Check if device supports Force Touch / 3D Touch
    if (Platform.OS === 'ios') {
      // Check iOS version (3D Touch available on iPhone 6s and later, removed in iPhone 11)
      // Haptic Touch is available on newer devices
      // In production, would check via native module
      this.isSupported = true; // Assume supported for now
    } else if (Platform.OS === 'android') {
      // Android doesn't have native Force Touch, but some devices support pressure sensitivity
      // In production, would check device capabilities
      this.isSupported = false;
    }
  }

  private setupEventListeners(): void {
    // Listen for Force Touch events
    DeviceEventEmitter.addListener('force_touch_start', (data: any) => {
      this.handleForceTouchStart(data);
    });

    DeviceEventEmitter.addListener('force_touch_change', (data: any) => {
      this.handleForceTouchChange(data);
    });

    DeviceEventEmitter.addListener('force_touch_end', (data: any) => {
      this.handleForceTouchEnd(data);
    });

    DeviceEventEmitter.addListener('force_touch_cancelled', (data: any) => {
      this.handleForceTouchCancelled(data);
    });

    DeviceEventEmitter.addListener('force_touch_action_selected', (data: any) => {
      this.handleActionSelected(data);
    });
  }

  // Register a Force Touch preview for a component
  public registerPreview(
    componentId: string,
    preview: ForceTouchPreview
  ): void {
    if (!this.isSupported) {
      console.warn('Force Touch not supported on this device');
      return;
    }

    this.previews.set(componentId, preview);

    // Register with native module
    // NativeModules.ForceTouchModule.registerPreview(componentId, preview);

    DeviceEventEmitter.emit('force_touch_preview_registered', componentId);
  }

  // Unregister a Force Touch preview
  public unregisterPreview(componentId: string): void {
    this.previews.delete(componentId);

    // Unregister from native module
    // NativeModules.ForceTouchModule.unregisterPreview(componentId);
  }

  // Handle Force Touch start
  private handleForceTouchStart(data: any): void {
    const {componentId, location} = data;
    const preview = this.previews.get(componentId);

    if (preview) {
      // Show preview
      DeviceEventEmitter.emit('force_touch_preview_show', {
        componentId,
        preview: preview.view,
        actions: preview.actions,
        location,
      });

      // Provide haptic feedback
      this.provideHapticFeedback('impact', 'medium');
    }
  }

  // Handle Force Touch pressure change
  private handleForceTouchChange(data: any): void {
    const {componentId, pressure} = data;

    // Provide haptic feedback based on pressure
    if (pressure > 0.8) {
      this.provideHapticFeedback('impact', 'heavy');
    } else if (pressure > 0.5) {
      this.provideHapticFeedback('impact', 'medium');
    } else if (pressure > 0.2) {
      this.provideHapticFeedback('impact', 'light');
    }

    DeviceEventEmitter.emit('force_touch_pressure_changed', {
      componentId,
      pressure,
    });
  }

  // Handle Force Touch end
  private handleForceTouchEnd(data: any): void {
    const {componentId, pressure} = data;

    if (pressure >= 0.8) {
      // Peek and pop - show full preview
      const preview = this.previews.get(componentId);
      if (preview) {
        DeviceEventEmitter.emit('force_touch_pop', {
          componentId,
          preview: preview.view,
        });
      }
    }

    DeviceEventEmitter.emit('force_touch_ended', {componentId});
  }

  // Handle Force Touch cancelled
  private handleForceTouchCancelled(data: any): void {
    const {componentId} = data;

    DeviceEventEmitter.emit('force_touch_preview_dismiss', {componentId});
  }

  // Handle action selection from preview
  private handleActionSelected(data: any): void {
    const {componentId, actionId} = data;
    const preview = this.previews.get(componentId);

    if (preview) {
      const action = preview.actions.find(a => a.id === actionId);
      if (action) {
        action.action();
        DeviceEventEmitter.emit('force_touch_action_executed', {
          componentId,
          actionId,
        });
      }
    }
  }

  // Provide haptic feedback
  private provideHapticFeedback(type: 'impact' | 'notification' | 'selection', style: 'light' | 'medium' | 'heavy'): void {
    // In production, would use native haptic feedback
    // NativeModules.HapticFeedbackModule.trigger(type, style);
    
    DeviceEventEmitter.emit('haptic_feedback', {type, style});
  }

  // Predefined Force Touch previews for common components
  public setupDefaultPreviews(): void {
    // Message preview
    this.registerPreview('message', {
      id: 'message',
      view: {type: 'message_preview'},
      actions: [
        {
          id: 'reply',
          title: 'Reply',
          icon: 'reply',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'ReplyMessage'});
          },
        },
        {
          id: 'forward',
          title: 'Forward',
          icon: 'forward',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'ForwardMessage'});
          },
        },
        {
          id: 'mark_read',
          title: 'Mark as Read',
          action: () => {
            DeviceEventEmitter.emit('mark_message_read');
          },
        },
      ],
    });

    // User profile preview
    this.registerPreview('user_profile', {
      id: 'user_profile',
      view: {type: 'user_profile_preview'},
      actions: [
        {
          id: 'message',
          title: 'Send Message',
          icon: 'message',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'ComposeMessage'});
          },
        },
        {
          id: 'call',
          title: 'Call',
          icon: 'call',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'StartCall'});
          },
        },
        {
          id: 'view_profile',
          title: 'View Profile',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'UserProfile'});
          },
        },
      ],
    });

    // Task preview
    this.registerPreview('task', {
      id: 'task',
      view: {type: 'task_preview'},
      actions: [
        {
          id: 'complete',
          title: 'Complete',
          icon: 'checkmark',
          action: () => {
            DeviceEventEmitter.emit('complete_task');
          },
        },
        {
          id: 'edit',
          title: 'Edit',
          icon: 'edit',
          action: () => {
            DeviceEventEmitter.emit('navigate', {screen: 'EditTask'});
          },
        },
        {
          id: 'share',
          title: 'Share',
          icon: 'share',
          action: () => {
            DeviceEventEmitter.emit('share_task');
          },
        },
      ],
    });
  }

  public isForceTouchSupported(): boolean {
    return this.isSupported;
  }
}

export default ForceTouchHandler;

