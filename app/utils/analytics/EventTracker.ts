// EventTracker.ts - Advanced Event Tracking for METR
import {METRAnalytics} from './METRAnalytics';
import {DeviceEventEmitter} from 'react-native';

interface Event {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface EventConfig {
  enableTracking: boolean;
  enableAutoTracking: boolean;
  sampleRate: number; // 0-1
  batchSize: number;
  flushInterval: number;
}

export class EventTracker {
  private static instance: EventTracker;
  private config: EventConfig;
  private events: Event[] = [];
  private analytics: METRAnalytics;
  private sessionId: string;
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enableTracking: true,
      enableAutoTracking: true,
      sampleRate: 1.0,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
    };

    this.analytics = METRAnalytics.getInstance();
    this.sessionId = this.generateSessionId();
    this.setupAutoTracking();
    this.setupFlushInterval();
  }

  public static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  // Track event
  public track(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enableTracking) {
      return;
    }

    // Sample rate check
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    const event: Event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(event);

    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Track screen view
  public trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user action
  public trackAction(actionName: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action_name: actionName,
      ...properties,
    });
  }

  // Track conversion
  public trackConversion(conversionName: string, value?: number, properties?: Record<string, any>): void {
    this.track('conversion', {
      conversion_name: conversionName,
      value,
      ...properties,
    });
  }

  // Setup auto tracking
  private setupAutoTracking(): void {
    if (!this.config.enableAutoTracking) {
      return;
    }

    // Track app open
    DeviceEventEmitter.addListener('app_opened', () => {
      this.track('app_opened');
    });

    // Track app close
    DeviceEventEmitter.addListener('app_closed', () => {
      this.track('app_closed');
      this.flush();
    });

    // Track screen views
    DeviceEventEmitter.addListener('screen_view', (data: any) => {
      this.trackScreen(data.screen, data.properties);
    });
  }

  // Setup flush interval
  private setupFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Flush events
  public flush(): void {
    if (this.events.length === 0) {
      return;
    }

    const eventsToFlush = [...this.events];
    this.events = [];

    // Send to analytics
    eventsToFlush.forEach(event => {
      this.analytics.track(event.name, event.properties);
    });
  }

  // Generate session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configure tracker
  public configure(config: Partial<EventConfig>): void {
    this.config = {...this.config, ...config};
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.setupFlushInterval();
  }

  // Get events
  public getEvents(): Event[] {
    return [...this.events];
  }

  // Clear events
  public clear(): void {
    this.events = [];
  }
}

export default EventTracker;


