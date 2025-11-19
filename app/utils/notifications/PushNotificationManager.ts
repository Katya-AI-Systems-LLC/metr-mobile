// PushNotificationManager.ts - Advanced Push Notification Management for METR
import {Notifications} from 'react-native-notifications';
import {DeviceEventEmitter, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationConfig {
  enablePush: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  enableBadge: boolean;
  enableInApp: boolean;
  quietHours: {start: string; end: string} | null;
}

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  category?: string;
  priority: 'min' | 'low' | 'default' | 'high' | 'max';
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private config: NotificationConfig;
  private deviceToken: string | null = null;
  private notificationHistory: NotificationData[] = [];

  private constructor() {
    this.config = {
      enablePush: true,
      enableSound: true,
      enableVibration: true,
      enableBadge: true,
      enableInApp: true,
      quietHours: null,
    };

    this.setupNotifications();
    this.loadConfig();
  }

  public static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  private setupNotifications(): void {
    // Request permissions
    Notifications.requestPermissions();

    // Register device
    Notifications.registerRemoteNotifications();

    // Event listeners
    Notifications.events().registerRemoteNotificationsRegistered((event: any) => {
      this.deviceToken = event.deviceToken;
      DeviceEventEmitter.emit('push_token_registered', {token: event.deviceToken});
    });

    Notifications.events().registerRemoteNotificationsRegistrationFailed((event: any) => {
      console.error('Push notification registration failed:', event);
    });

    Notifications.events().registerNotificationReceivedForeground((notification: any) => {
      if (this.config.enableInApp) {
        this.handleNotification(notification);
      }
    });

    Notifications.events().registerNotificationOpened((notification: any) => {
      this.handleNotificationOpened(notification);
    });
  }

  // Send local notification
  public async sendLocalNotification(notification: NotificationData): Promise<void> {
    if (!this.config.enablePush) {
      return;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      return;
    }

    Notifications.postLocalNotification({
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: this.config.enableSound ? notification.sound : undefined,
      badge: this.config.enableBadge ? notification.badge : undefined,
      category: notification.category,
      priority: notification.priority,
    });

    // Save to history
    this.notificationHistory.push(notification);
    if (this.notificationHistory.length > 100) {
      this.notificationHistory.shift();
    }
  }

  // Handle notification
  private handleNotification(notification: any): void {
    DeviceEventEmitter.emit('notification_received', {
      id: notification.identifier,
      title: notification.payload?.title,
      body: notification.payload?.body,
      data: notification.payload,
    });
  }

  // Handle notification opened
  private handleNotificationOpened(notification: any): void {
    DeviceEventEmitter.emit('notification_opened', {
      id: notification.identifier,
      data: notification.payload,
    });
  }

  // Check if quiet hours
  private isQuietHours(): boolean {
    if (!this.config.quietHours) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(this.config.quietHours.start.split(':')[0]);
    const endHour = parseInt(this.config.quietHours.end.split(':')[0]);

    if (startHour < endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  // Cancel notification
  public cancelNotification(notificationId: string): void {
    Notifications.cancelLocalNotification(notificationId);
  }

  // Cancel all notifications
  public cancelAllNotifications(): void {
    Notifications.cancelAllLocalNotifications();
  }

  // Get notification history
  public getHistory(): NotificationData[] {
    return [...this.notificationHistory];
  }

  // Configure notifications
  public async configure(config: Partial<NotificationConfig>): Promise<void> {
    this.config = {...this.config, ...config};
    await this.saveConfig();
  }

  // Load config
  private async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notification_config');
      if (stored) {
        this.config = {...this.config, ...JSON.parse(stored)};
      }
    } catch (error) {
      console.error('Failed to load notification config:', error);
    }
  }

  // Save config
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save notification config:', error);
    }
  }

  // Get device token
  public getDeviceToken(): string | null {
    return this.deviceToken;
  }
}

export default PushNotificationManager;


