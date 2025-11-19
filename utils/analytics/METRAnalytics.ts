// METRAnalytics.ts - Advanced Analytics for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter} from 'react-native';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface UserProperties {
  userId: string;
  properties: Record<string, any>;
}

interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
}

export class METRAnalytics {
  private static instance: METRAnalytics;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private enabled: boolean = true;
  private batchSize: number = 50;
  private flushInterval: number = 30000; // 30 seconds

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
    this.loadStoredEvents();
  }

  public static getInstance(): METRAnalytics {
    if (!METRAnalytics.instance) {
      METRAnalytics.instance = new METRAnalytics();
    }
    return METRAnalytics.instance;
  }

  // Track an event
  public track(eventName: string, properties?: Record<string, any>): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        platform: 'mobile',
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    DeviceEventEmitter.emit('analytics_event', event);

    // Flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  // Identify user
  public identify(userId: string, properties?: Record<string, any>): void {
    this.userId = userId;
    
    const userProperties: UserProperties = {
      userId,
      properties: properties || {},
    };

    AsyncStorage.setItem('analytics_user', JSON.stringify(userProperties));
    this.track('user_identified', {userId, ...properties});
  }

  // Track screen view
  public screen(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user action
  public action(actionName: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action_name: actionName,
      ...properties,
    });
  }

  // Track error
  public error(error: Error, properties?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...properties,
    });
  }

  // Track conversion
  public conversion(conversionName: string, value?: number, properties?: Record<string, any>): void {
    this.track('conversion', {
      conversion_name: conversionName,
      value,
      ...properties,
    });
  }

  // Create funnel
  public createFunnel(funnelName: string, steps: string[]): void {
    this.track('funnel_created', {
      funnel_name: funnelName,
      steps,
    });
  }

  // Track funnel step
  public trackFunnelStep(funnelName: string, stepName: string, properties?: Record<string, any>): void {
    this.track('funnel_step', {
      funnel_name: funnelName,
      step_name: stepName,
      ...properties,
    });
  }

  // Get analytics data
  public async getAnalytics(timeRange?: {start: number; end: number}): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    topEvents: Array<{name: string; count: number}>;
    userCount: number;
    sessionCount: number;
  }> {
    let events = this.events;

    if (timeRange) {
      events = events.filter(
        e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
      );
    }

    const eventsByType: Record<string, number> = {};
    const eventCounts: Record<string, number> = {};
    const userIds = new Set<string>();
    const sessionIds = new Set<string>();

    events.forEach(event => {
      eventsByType[event.name] = (eventsByType[event.name] || 0) + 1;
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
      if (event.userId) userIds.add(event.userId);
      sessionIds.add(event.sessionId);
    });

    const topEvents = Object.entries(eventCounts)
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: events.length,
      eventsByType,
      topEvents,
      userCount: userIds.size,
      sessionCount: sessionIds.size,
    };
  }

  // Flush events to storage/server
  public async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Store locally
      const stored = await AsyncStorage.getItem('analytics_events');
      const storedEvents = stored ? JSON.parse(stored) : [];
      const allEvents = [...storedEvents, ...eventsToFlush];
      
      // Keep only last 1000 events
      const eventsToKeep = allEvents.slice(-1000);
      await AsyncStorage.setItem('analytics_events', JSON.stringify(eventsToKeep));

      // In production, send to analytics server
      // await this.sendToServer(eventsToFlush);
    } catch (error) {
      console.error('Failed to flush analytics:', error);
      // Restore events if flush failed
      this.events = [...eventsToFlush, ...this.events];
    }
  }

  // Load stored events
  private async loadStoredEvents(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('analytics_events');
      if (stored) {
        const storedEvents = JSON.parse(stored);
        this.events = storedEvents.slice(-100); // Load last 100 events
      }
    } catch (error) {
      console.error('Failed to load stored events:', error);
    }
  }

  // Auto flush interval
  private setupAutoFlush(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Generate session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enable/disable analytics
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // Clear all analytics data
  public async clear(): Promise<void> {
    this.events = [];
    await AsyncStorage.removeItem('analytics_events');
    await AsyncStorage.removeItem('analytics_user');
  }
}

export default METRAnalytics;


