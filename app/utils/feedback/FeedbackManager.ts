// FeedbackManager.ts - User Feedback Management for METR
import {DeviceEventEmitter, Linking, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  screenshots?: string[];
  deviceInfo?: {
    platform: string;
    version: string;
    model: string;
  };
  timestamp: number;
  status: 'pending' | 'submitted' | 'reviewed' | 'resolved';
}

interface FeedbackConfig {
  enableAutoCollection: boolean;
  enableScreenshot: boolean;
  enableDeviceInfo: boolean;
  feedbackEmail: string;
}

export class FeedbackManager {
  private static instance: FeedbackManager;
  private config: FeedbackConfig;
  private feedbackQueue: Feedback[] = [];

  private constructor() {
    this.config = {
      enableAutoCollection: true,
      enableScreenshot: true,
      enableDeviceInfo: true,
      feedbackEmail: 'feedback@metr.app',
    };

    this.loadFeedbackQueue();
  }

  public static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager();
    }
    return FeedbackManager.instance;
  }

  // Submit feedback
  public async submitFeedback(
    type: Feedback['type'],
    title: string,
    description: string,
    screenshots?: string[]
  ): Promise<string> {
    const feedback: Feedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      screenshots,
      deviceInfo: this.config.enableDeviceInfo ? this.getDeviceInfo() : undefined,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.feedbackQueue.push(feedback);
    await this.saveFeedbackQueue();

    // Submit feedback
    await this.sendFeedback(feedback);

    DeviceEventEmitter.emit('feedback_submitted', {feedbackId: feedback.id});

    return feedback.id;
  }

  // Send feedback
  private async sendFeedback(feedback: Feedback): Promise<void> {
    try {
      // In production, send to feedback API
      // For now, prepare email
      const subject = `[${feedback.type.toUpperCase()}] ${feedback.title}`;
      const body = `
Description: ${feedback.description}

Device Info: ${JSON.stringify(feedback.deviceInfo, null, 2)}

Timestamp: ${new Date(feedback.timestamp).toISOString()}
      `.trim();

      // Open email client
      const emailUrl = `mailto:${this.config.feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(emailUrl);

      feedback.status = 'submitted';
      await this.saveFeedbackQueue();
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  }

  // Get device info
  private getDeviceInfo(): Feedback['deviceInfo'] {
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
      model: Platform.select({
        ios: 'iOS Device',
        android: 'Android Device',
        default: 'Unknown',
      }) || 'Unknown',
    };
  }

  // Get feedback queue
  public getFeedbackQueue(): Feedback[] {
    return [...this.feedbackQueue];
  }

  // Save feedback queue
  private async saveFeedbackQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('feedback_queue', JSON.stringify(this.feedbackQueue));
    } catch (error) {
      console.error('Failed to save feedback queue:', error);
    }
  }

  // Load feedback queue
  private async loadFeedbackQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('feedback_queue');
      if (stored) {
        this.feedbackQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load feedback queue:', error);
    }
  }

  // Configure feedback manager
  public configure(config: Partial<FeedbackConfig>): void {
    this.config = {...this.config, ...config};
  }
}

export default FeedbackManager;


