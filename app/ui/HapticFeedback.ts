// HapticFeedback.ts - Advanced Haptic Feedback System for METR
import {Vibration, Platform} from 'react-native';
import {DeviceEventEmitter} from 'react-native';

interface HapticPattern {
  id: string;
  name: string;
  type: 'impact' | 'notification' | 'selection' | 'custom';
  pattern: number[];
  intensity: 'light' | 'medium' | 'heavy';
  duration: number;
  iOS?: IOSHapticPattern;
  android?: AndroidHapticPattern;
}

interface IOSHapticPattern {
  impactStyle?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
  notificationType?: 'success' | 'warning' | 'error';
  sharpness?: number; // 0-1
  intensity?: number; // 0-1
}

interface AndroidHapticPattern {
  amplitude?: number; // 0-255
  repeat?: number;
  effectId?: number;
}

interface HapticSequence {
  steps: HapticStep[];
  loop: boolean;
  interval: number;
}

interface HapticStep {
  type: 'vibrate' | 'pause' | 'ramp';
  duration: number;
  intensity?: number;
  curve?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface HapticContext {
  action: string;
  component: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  userPreference: boolean;
}

export class HapticFeedback {
  private static instance: HapticFeedback;
  private patterns: Map<string, HapticPattern> = new Map();
  private sequences: Map<string, HapticSequence> = new Map();
  private isEnabled: boolean = true;
  private intensityMultiplier: number = 1.0;
  private currentSequence: any = null;
  private hapticHistory: Array<{pattern: string; timestamp: number}> = [];
  private customPatterns: Map<string, HapticPattern> = new Map();
  
  private constructor() {
    this.initialize();
  }

  public static getInstance(): HapticFeedback {
    if (!HapticFeedback.instance) {
      HapticFeedback.instance = new HapticFeedback();
    }
    return HapticFeedback.instance;
  }

  private initialize() {
    this.setupDefaultPatterns();
    this.setupEventListeners();
    this.loadUserPreferences();
  }

  private setupDefaultPatterns() {
    // Basic patterns
    this.patterns.set('tap', {
      id: 'tap',
      name: 'Tap',
      type: 'impact',
      pattern: [10],
      intensity: 'light',
      duration: 10,
      iOS: {impactStyle: 'light'},
      android: {amplitude: 50},
    });

    this.patterns.set('success', {
      id: 'success',
      name: 'Success',
      type: 'notification',
      pattern: [0, 50, 50, 50],
      intensity: 'medium',
      duration: 150,
      iOS: {notificationType: 'success'},
      android: {amplitude: 150},
    });

    this.patterns.set('error', {
      id: 'error',
      name: 'Error',
      type: 'notification',
      pattern: [0, 100, 100, 100, 100, 100],
      intensity: 'heavy',
      duration: 500,
      iOS: {notificationType: 'error'},
      android: {amplitude: 255},
    });

    this.patterns.set('warning', {
      id: 'warning',
      name: 'Warning',
      type: 'notification',
      pattern: [0, 75, 75, 75],
      intensity: 'medium',
      duration: 225,
      iOS: {notificationType: 'warning'},
      android: {amplitude: 180},
    });

    this.patterns.set('selection', {
      id: 'selection',
      name: 'Selection',
      type: 'selection',
      pattern: [5],
      intensity: 'light',
      duration: 5,
      iOS: {impactStyle: 'light', intensity: 0.5},
      android: {amplitude: 30},
    });

    // Complex patterns
    this.patterns.set('heartbeat', {
      id: 'heartbeat',
      name: 'Heartbeat',
      type: 'custom',
      pattern: [0, 60, 40, 60, 600],
      intensity: 'medium',
      duration: 760,
    });

    this.patterns.set('morse_sos', {
      id: 'morse_sos',
      name: 'SOS',
      type: 'custom',
      pattern: [0, 100, 100, 100, 100, 100, 300, 200, 100, 200, 100, 200, 300, 100, 100, 100, 100, 100],
      intensity: 'heavy',
      duration: 2100,
    });

    this.patterns.set('notification_gentle', {
      id: 'notification_gentle',
      name: 'Gentle Notification',
      type: 'notification',
      pattern: [0, 30, 70, 30],
      intensity: 'light',
      duration: 130,
    });

    this.patterns.set('scroll_bounce', {
      id: 'scroll_bounce',
      name: 'Scroll Bounce',
      type: 'impact',
      pattern: [0, 15, 10, 10, 5, 5],
      intensity: 'light',
      duration: 45,
    });

    this.patterns.set('long_press', {
      id: 'long_press',
      name: 'Long Press',
      type: 'impact',
      pattern: [0, 20, 10, 30],
      intensity: 'medium',
      duration: 60,
    });

    // Gesture patterns
    this.patterns.set('swipe', {
      id: 'swipe',
      name: 'Swipe',
      type: 'impact',
      pattern: [0, 8, 4, 6, 2, 4],
      intensity: 'light',
      duration: 24,
    });

    this.patterns.set('pinch', {
      id: 'pinch',
      name: 'Pinch',
      type: 'impact',
      pattern: [0, 15, 5, 15],
      intensity: 'medium',
      duration: 35,
    });

    this.patterns.set('rotate', {
      id: 'rotate',
      name: 'Rotate',
      type: 'impact',
      pattern: [0, 5, 5, 5, 5, 5, 5],
      intensity: 'light',
      duration: 30,
    });

    // Game-like patterns
    this.patterns.set('level_up', {
      id: 'level_up',
      name: 'Level Up',
      type: 'custom',
      pattern: [0, 50, 30, 70, 30, 90, 30, 110],
      intensity: 'heavy',
      duration: 350,
    });

    this.patterns.set('achievement', {
      id: 'achievement',
      name: 'Achievement',
      type: 'custom',
      pattern: [0, 100, 50, 50, 50, 100],
      intensity: 'medium',
      duration: 350,
    });

    this.patterns.set('coin_collect', {
      id: 'coin_collect',
      name: 'Coin Collect',
      type: 'custom',
      pattern: [0, 20, 10, 20],
      intensity: 'light',
      duration: 50,
    });

    // Setup sequences
    this.setupSequences();
  }

  private setupSequences() {
    // Countdown sequence
    this.sequences.set('countdown', {
      steps: [
        {type: 'vibrate', duration: 100, intensity: 0.3},
        {type: 'pause', duration: 900},
        {type: 'vibrate', duration: 100, intensity: 0.5},
        {type: 'pause', duration: 900},
        {type: 'vibrate', duration: 100, intensity: 0.7},
        {type: 'pause', duration: 900},
        {type: 'vibrate', duration: 500, intensity: 1.0},
      ],
      loop: false,
      interval: 0,
    });

    // Pulse sequence
    this.sequences.set('pulse', {
      steps: [
        {type: 'ramp', duration: 200, intensity: 1.0, curve: 'ease-in'},
        {type: 'ramp', duration: 200, intensity: 0.0, curve: 'ease-out'},
        {type: 'pause', duration: 100},
      ],
      loop: true,
      interval: 0,
    });

    // Alert sequence
    this.sequences.set('alert', {
      steps: [
        {type: 'vibrate', duration: 200, intensity: 1.0},
        {type: 'pause', duration: 100},
        {type: 'vibrate', duration: 200, intensity: 1.0},
        {type: 'pause', duration: 100},
        {type: 'vibrate', duration: 400, intensity: 1.0},
      ],
      loop: false,
      interval: 0,
    });
  }

  private setupEventListeners() {
    DeviceEventEmitter.addListener('haptic_trigger', this.handleHapticTrigger.bind(this));
    DeviceEventEmitter.addListener('haptic_sequence', this.playSequence.bind(this));
    DeviceEventEmitter.addListener('haptic_stop', this.stopCurrentSequence.bind(this));
  }

  // Core Haptic Methods
  public play(patternId: string, context?: HapticContext): void {
    if (!this.isEnabled) return;
    
    // Check user preferences and context
    if (context && !this.shouldPlayForContext(context)) return;
    
    const pattern = this.patterns.get(patternId) || this.customPatterns.get(patternId);
    if (!pattern) {
      console.warn(`Haptic pattern '${patternId}' not found`);
      return;
    }

    // Record to history
    this.hapticHistory.push({pattern: patternId, timestamp: Date.now()});
    if (this.hapticHistory.length > 100) {
      this.hapticHistory.shift();
    }

    // Play pattern based on platform
    if (Platform.OS === 'ios') {
      this.playIOSHaptic(pattern);
    } else if (Platform.OS === 'android') {
      this.playAndroidHaptic(pattern);
    } else {
      this.playGenericHaptic(pattern);
    }
  }

  private playIOSHaptic(pattern: HapticPattern): void {
    if (pattern.iOS) {
      // Use iOS-specific haptic APIs (requires native module)
      // For now, use generic vibration
      this.playGenericHaptic(pattern);
    } else {
      this.playGenericHaptic(pattern);
    }
  }

  private playAndroidHaptic(pattern: HapticPattern): void {
    if (pattern.android) {
      // Use Android-specific haptic APIs (requires native module)
      // For now, use generic vibration
      this.playGenericHaptic(pattern);
    } else {
      this.playGenericHaptic(pattern);
    }
  }

  private playGenericHaptic(pattern: HapticPattern): void {
    const adjustedPattern = this.adjustPatternIntensity(pattern.pattern);
    Vibration.vibrate(adjustedPattern);
  }

  private adjustPatternIntensity(pattern: number[]): number[] {
    return pattern.map((duration, index) => {
      // Only adjust vibration durations, not pauses (odd indices)
      if (index % 2 === 1) {
        return Math.round(duration * this.intensityMultiplier);
      }
      return duration;
    });
  }

  // Sequence Playing
  public playSequence(sequenceId: string): void {
    if (!this.isEnabled) return;
    
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      console.warn(`Haptic sequence '${sequenceId}' not found`);
      return;
    }

    this.stopCurrentSequence();
    this.executeSequence(sequence);
  }

  private executeSequence(sequence: HapticSequence): void {
    let stepIndex = 0;
    
    const executeStep = () => {
      if (stepIndex >= sequence.steps.length) {
        if (sequence.loop) {
          stepIndex = 0;
        } else {
          this.currentSequence = null;
          return;
        }
      }

      const step = sequence.steps[stepIndex];
      this.executeStep(step);
      
      stepIndex++;
      this.currentSequence = setTimeout(executeStep, step.duration + sequence.interval);
    };

    executeStep();
  }

  private executeStep(step: HapticStep): void {
    switch (step.type) {
      case 'vibrate':
        const duration = Math.round(step.duration * (step.intensity || 1) * this.intensityMultiplier);
        Vibration.vibrate(duration);
        break;
      case 'pause':
        // Just wait
        break;
      case 'ramp':
        this.executeRamp(step);
        break;
    }
  }

  private executeRamp(step: HapticStep): void {
    // Simulate ramping effect with multiple short vibrations
    const steps = 10;
    const stepDuration = step.duration / steps;
    
    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      let intensity = 0;
      
      switch (step.curve) {
        case 'linear':
          intensity = progress;
          break;
        case 'ease-in':
          intensity = progress * progress;
          break;
        case 'ease-out':
          intensity = 1 - (1 - progress) * (1 - progress);
          break;
        case 'ease-in-out':
          intensity = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          break;
      }
      
      setTimeout(() => {
        const vibrateDuration = Math.round(stepDuration * intensity * (step.intensity || 1));
        if (vibrateDuration > 0) {
          Vibration.vibrate(vibrateDuration);
        }
      }, i * stepDuration);
    }
  }

  public stopCurrentSequence(): void {
    if (this.currentSequence) {
      clearTimeout(this.currentSequence);
      this.currentSequence = null;
      Vibration.cancel();
    }
  }

  // Context Management
  private shouldPlayForContext(context: HapticContext): boolean {
    // Check user preference
    if (!context.userPreference) return false;
    
    // Check importance level
    if (context.importance === 'low' && this.intensityMultiplier < 0.5) return false;
    
    // Check if too many haptics recently
    const recentCount = this.hapticHistory.filter(
      h => Date.now() - h.timestamp < 1000
    ).length;
    if (recentCount > 5) return false; // Prevent haptic spam
    
    return true;
  }

  // Custom Pattern Creation
  public createCustomPattern(
    id: string,
    name: string,
    pattern: number[],
    intensity: HapticPattern['intensity'] = 'medium'
  ): void {
    const customPattern: HapticPattern = {
      id,
      name,
      type: 'custom',
      pattern,
      intensity,
      duration: pattern.reduce((a, b) => a + b, 0),
    };
    
    this.customPatterns.set(id, customPattern);
    this.saveCustomPatterns();
  }

  public testPattern(pattern: number[]): void {
    if (!this.isEnabled) return;
    Vibration.vibrate(pattern);
  }

  // Settings
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopCurrentSequence();
    }
  }

  public setIntensity(multiplier: number): void {
    this.intensityMultiplier = Math.max(0, Math.min(2, multiplier));
  }

  // Event Handlers
  private handleHapticTrigger(event: any): void {
    const {pattern, context} = event;
    this.play(pattern, context);
  }

  // Persistence
  private async loadUserPreferences(): Promise<void> {
    // Load from AsyncStorage in production
    // For now, use defaults
  }

  private async saveCustomPatterns(): Promise<void> {
    // Save to AsyncStorage in production
  }

  // Public API
  public isHapticEnabled(): boolean {
    return this.isEnabled;
  }

  public getIntensity(): number {
    return this.intensityMultiplier;
  }

  public getAvailablePatterns(): string[] {
    return [
      ...Array.from(this.patterns.keys()),
      ...Array.from(this.customPatterns.keys()),
    ];
  }

  public getHapticHistory(): Array<{pattern: string; timestamp: number}> {
    return this.hapticHistory;
  }

  public clearHistory(): void {
    this.hapticHistory = [];
  }

  // Predefined quick access methods
  public tapLight(): void {
    this.play('tap');
  }

  public tapMedium(): void {
    this.play('long_press');
  }

  public success(): void {
    this.play('success');
  }

  public error(): void {
    this.play('error');
  }

  public warning(): void {
    this.play('warning');
  }

  public selection(): void {
    this.play('selection');
  }

  public notification(): void {
    this.play('notification_gentle');
  }
}
