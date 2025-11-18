// MicroInteractions.ts - Smooth micro-animations for METR
import {Animated, Easing, Vibration} from 'react-native';
import {DeviceEventEmitter} from 'react-native';

interface Animation {
  id: string;
  type: 'scale' | 'rotate' | 'fade' | 'slide' | 'bounce' | 'pulse' | 'ripple' | 'morph';
  target: Animated.Value | Animated.ValueXY;
  duration: number;
  easing: (value: number) => number;
  loop?: boolean;
  delay?: number;
}

interface InteractionFeedback {
  visual: Animation;
  haptic?: number;
  sound?: string;
}

interface GestureAnimation {
  gesture: 'tap' | 'longPress' | 'swipe' | 'pinch' | 'rotate' | 'pan';
  animation: Animation;
  threshold?: number;
}

export class MicroInteractions {
  private static instance: MicroInteractions;
  private animations: Map<string, Animation> = new Map();
  private activeAnimations: Set<Animated.CompositeAnimation> = new Set();
  private gestureAnimations: Map<string, GestureAnimation> = new Map();
  
  // Predefined animation values
  private buttonScale = new Animated.Value(1);
  private cardElevation = new Animated.Value(0);
  private rippleRadius = new Animated.Value(0);
  private rippleOpacity = new Animated.Value(0);
  private morphProgress = new Animated.Value(0);
  private pulseValue = new Animated.Value(1);
  private bounceValue = new Animated.Value(0);
  private rotateValue = new Animated.Value(0);
  
  private constructor() {
    this.setupPredefinedAnimations();
    this.setupEventListeners();
  }

  public static getInstance(): MicroInteractions {
    if (!MicroInteractions.instance) {
      MicroInteractions.instance = new MicroInteractions();
    }
    return MicroInteractions.instance;
  }

  private setupPredefinedAnimations() {
    // Button press animation
    this.animations.set('buttonPress', {
      id: 'buttonPress',
      type: 'scale',
      target: this.buttonScale,
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });

    // Card hover animation
    this.animations.set('cardHover', {
      id: 'cardHover',
      type: 'scale',
      target: this.cardElevation,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });

    // Ripple effect
    this.animations.set('ripple', {
      id: 'ripple',
      type: 'ripple',
      target: this.rippleRadius,
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    // Pulse animation
    this.animations.set('pulse', {
      id: 'pulse',
      type: 'pulse',
      target: this.pulseValue,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      loop: true,
    });

    // Bounce animation
    this.animations.set('bounce', {
      id: 'bounce',
      type: 'bounce',
      target: this.bounceValue,
      duration: 800,
      easing: Easing.bounce,
    });

    // Morph animation
    this.animations.set('morph', {
      id: 'morph',
      type: 'morph',
      target: this.morphProgress,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }

  private setupEventListeners() {
    DeviceEventEmitter.addListener('ui_interaction', this.handleInteraction.bind(this));
    DeviceEventEmitter.addListener('gesture_detected', this.handleGesture.bind(this));
  }

  // Core Animation Methods
  public animateButton(pressed: boolean): Animated.Value {
    const toValue = pressed ? 0.95 : 1;
    
    Animated.spring(this.buttonScale, {
      toValue,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (pressed) {
      this.playHapticFeedback('light');
    }

    return this.buttonScale;
  }

  public animateCardPress(cardId: string): Animated.Value {
    const animation = Animated.sequence([
      Animated.timing(this.cardElevation, {
        toValue: 10,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(this.cardElevation, {
        toValue: 0,
        duration: 100,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]);

    animation.start();
    this.activeAnimations.add(animation);
    
    return this.cardElevation;
  }

  public animateRipple(x: number, y: number, maxRadius: number = 200): void {
    this.rippleOpacity.setValue(0.5);
    this.rippleRadius.setValue(0);

    Animated.parallel([
      Animated.timing(this.rippleRadius, {
        toValue: maxRadius,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(this.rippleOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.rippleRadius.setValue(0);
      this.rippleOpacity.setValue(0);
    });
  }

  public animatePulse(): Animated.Value {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulseValue, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.pulseValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    this.activeAnimations.add(animation);
    
    return this.pulseValue;
  }

  public animateBounce(): Animated.Value {
    Animated.sequence([
      Animated.timing(this.bounceValue, {
        toValue: -30,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(this.bounceValue, {
        toValue: 0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    return this.bounceValue;
  }

  public animateMorph(fromShape: string, toShape: string): Animated.Value {
    Animated.timing(this.morphProgress, {
      toValue: 1,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    return this.morphProgress;
  }

  public animateRotate(degrees: number = 360): Animated.Value {
    Animated.timing(this.rotateValue, {
      toValue: degrees,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      this.rotateValue.setValue(0);
    });

    return this.rotateValue;
  }

  // Gesture-based animations
  public animateSwipe(direction: 'left' | 'right' | 'up' | 'down'): Animated.ValueXY {
    const position = new Animated.ValueXY();
    const endValue = {x: 0, y: 0};

    switch (direction) {
      case 'left': endValue.x = -300; break;
      case 'right': endValue.x = 300; break;
      case 'up': endValue.y = -300; break;
      case 'down': endValue.y = 300; break;
    }

    Animated.spring(position, {
      toValue: endValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    return position;
  }

  public animatePinch(scale: number): Animated.Value {
    const scaleValue = new Animated.Value(1);
    
    Animated.spring(scaleValue, {
      toValue: scale,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    return scaleValue;
  }

  public animatePan(x: number, y: number): Animated.ValueXY {
    const position = new Animated.ValueXY({x, y});
    
    Animated.spring(position, {
      toValue: {x: 0, y: 0},
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    return position;
  }

  // Complex animations
  public animatePageTransition(type: 'slide' | 'fade' | 'zoom'): Animated.Value {
    const transitionValue = new Animated.Value(0);
    
    Animated.timing(transitionValue, {
      toValue: 1,
      duration: 300,
      easing: type === 'slide' ? Easing.out(Easing.cubic) : Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    return transitionValue;
  }

  public animateListItem(index: number, total: number): Animated.Value {
    const staggerDelay = index * 50;
    const opacity = new Animated.Value(0);
    const translateY = new Animated.Value(20);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, staggerDelay);

    return opacity;
  }

  public animateSuccess(): void {
    const sequence = Animated.sequence([
      Animated.timing(this.buttonScale, {
        toValue: 1.2,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(this.buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);

    sequence.start();
    this.playHapticFeedback('success');
  }

  public animateError(): void {
    const shakeValue = new Animated.Value(0);
    
    Animated.sequence([
      Animated.timing(shakeValue, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeValue, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeValue, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeValue, {toValue: 0, duration: 50, useNativeDriver: true}),
    ]).start();

    this.playHapticFeedback('error');
  }

  public animateLoading(): Animated.Value {
    const rotation = new Animated.Value(0);
    
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 360,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return rotation;
  }

  // Skeleton loading animation
  public animateSkeleton(): Animated.Value {
    const shimmer = new Animated.Value(0);
    
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return shimmer;
  }

  // Haptic feedback
  private playHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error'): void {
    const patterns: Record<string, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: 40,
      error: 50,
    };

    Vibration.vibrate(patterns[type] || 10);
  }

  // Event handlers
  private handleInteraction(event: any): void {
    const {type, target} = event;
    
    switch (type) {
      case 'button_press':
        this.animateButton(true);
        break;
      case 'button_release':
        this.animateButton(false);
        break;
      case 'card_tap':
        this.animateCardPress(target);
        break;
      case 'list_refresh':
        this.animatePulse();
        break;
    }
  }

  private handleGesture(event: any): void {
    const {gesture, params} = event;
    
    switch (gesture) {
      case 'swipe':
        this.animateSwipe(params.direction);
        break;
      case 'pinch':
        this.animatePinch(params.scale);
        break;
      case 'pan':
        this.animatePan(params.x, params.y);
        break;
    }
  }

  // Cleanup
  public stopAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.stop());
    this.activeAnimations.clear();
  }

  public resetAnimations(): void {
    this.buttonScale.setValue(1);
    this.cardElevation.setValue(0);
    this.rippleRadius.setValue(0);
    this.rippleOpacity.setValue(0);
    this.morphProgress.setValue(0);
    this.pulseValue.setValue(1);
    this.bounceValue.setValue(0);
    this.rotateValue.setValue(0);
  }

  // Custom animation builder
  public createCustomAnimation(
    config: {
      from: number;
      to: number;
      duration: number;
      easing?: (value: number) => number;
      loop?: boolean;
    }
  ): Animated.Value {
    const animatedValue = new Animated.Value(config.from);
    
    const animation = Animated.timing(animatedValue, {
      toValue: config.to,
      duration: config.duration,
      easing: config.easing || Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });

    if (config.loop) {
      Animated.loop(animation).start();
    } else {
      animation.start();
    }

    return animatedValue;
  }
}
