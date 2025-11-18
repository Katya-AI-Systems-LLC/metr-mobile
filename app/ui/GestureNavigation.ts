// GestureNavigation.ts - Advanced Gesture Navigation for METR
import {PanResponder, GestureResponderEvent, PanResponderGestureState} from 'react-native';
import {DeviceEventEmitter} from 'react-native';

interface Gesture {
  type: 'swipe' | 'pinch' | 'rotate' | 'pan' | 'tap' | 'longPress' | 'doubleTap' | 'threeFinger' | 'edge';
  direction?: 'up' | 'down' | 'left' | 'right';
  fingers: number;
  velocity: number;
  distance: number;
  angle?: number;
  scale?: number;
  duration: number;
  startPosition: {x: number; y: number};
  endPosition: {x: number; y: number};
}

interface GestureMapping {
  gesture: Gesture['type'];
  action: string;
  enabled: boolean;
  sensitivity: number;
  hapticFeedback: boolean;
}

interface EdgeGesture {
  edge: 'top' | 'bottom' | 'left' | 'right';
  action: string;
  threshold: number;
}

export class GestureNavigation {
  private static instance: GestureNavigation;
  private gestureMappings: Map<string, GestureMapping> = new Map();
  private edgeGestures: EdgeGesture[] = [];
  private currentGesture: Partial<Gesture> | null = null;
  private touchHistory: Array<{x: number; y: number; timestamp: number}> = [];
  private multiTouchPoints: Array<{x: number; y: number}> = [];
  private gestureRecognizers: Map<string, any> = new Map();
  private isGestureInProgress: boolean = false;
  
  // Gesture thresholds
  private readonly SWIPE_THRESHOLD = 50;
  private readonly SWIPE_VELOCITY_THRESHOLD = 0.3;
  private readonly PINCH_THRESHOLD = 0.2;
  private readonly ROTATION_THRESHOLD = 0.1;
  private readonly LONG_PRESS_DURATION = 500;
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly EDGE_THRESHOLD = 20;
  
  private constructor() {
    this.setupDefaultGestures();
    this.createPanResponders();
  }

  public static getInstance(): GestureNavigation {
    if (!GestureNavigation.instance) {
      GestureNavigation.instance = new GestureNavigation();
    }
    return GestureNavigation.instance;
  }

  private setupDefaultGestures() {
    // Navigation gestures
    this.gestureMappings.set('swipe_right_back', {
      gesture: 'swipe',
      action: 'navigate_back',
      enabled: true,
      sensitivity: 1.0,
      hapticFeedback: true,
    });

    this.gestureMappings.set('swipe_left_forward', {
      gesture: 'swipe',
      action: 'navigate_forward',
      enabled: true,
      sensitivity: 1.0,
      hapticFeedback: true,
    });

    this.gestureMappings.set('swipe_down_refresh', {
      gesture: 'swipe',
      action: 'refresh',
      enabled: true,
      sensitivity: 0.8,
      hapticFeedback: false,
    });

    // Productivity gestures
    this.gestureMappings.set('double_tap_zoom', {
      gesture: 'doubleTap',
      action: 'zoom',
      enabled: true,
      sensitivity: 1.0,
      hapticFeedback: false,
    });

    this.gestureMappings.set('pinch_zoom', {
      gesture: 'pinch',
      action: 'zoom_dynamic',
      enabled: true,
      sensitivity: 1.0,
      hapticFeedback: false,
    });

    this.gestureMappings.set('three_finger_swipe', {
      gesture: 'threeFinger',
      action: 'switch_workspace',
      enabled: true,
      sensitivity: 0.9,
      hapticFeedback: true,
    });

    // Edge gestures
    this.edgeGestures = [
      {edge: 'left', action: 'open_drawer', threshold: 20},
      {edge: 'right', action: 'open_notifications', threshold: 20},
      {edge: 'top', action: 'show_status', threshold: 10},
      {edge: 'bottom', action: 'show_dock', threshold: 30},
    ];
  }

  private createPanResponders() {
    const mainResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this.onGestureStart.bind(this),
      onPanResponderMove: this.onGestureMove.bind(this),
      onPanResponderRelease: this.onGestureEnd.bind(this),
      onPanResponderTerminate: this.onGestureCancel.bind(this),
    });

    this.gestureRecognizers.set('main', mainResponder);
  }

  // Gesture Detection
  private onGestureStart(evt: GestureResponderEvent, gestureState: PanResponderGestureState) {
    this.isGestureInProgress = true;
    
    const touches = evt.nativeEvent.touches;
    const timestamp = Date.now();
    
    this.currentGesture = {
      fingers: touches.length,
      startPosition: {x: gestureState.x0, y: gestureState.y0},
      duration: 0,
    };

    // Store touch points for multi-touch gestures
    this.multiTouchPoints = touches.map(touch => ({
      x: touch.pageX,
      y: touch.pageY,
    }));

    // Check for edge gesture
    this.checkEdgeGesture(gestureState.x0, gestureState.y0);

    // Check for long press
    setTimeout(() => {
      if (this.isGestureInProgress && this.currentGesture) {
        this.detectLongPress();
      }
    }, this.LONG_PRESS_DURATION);

    // Add to touch history for pattern recognition
    this.touchHistory.push({
      x: gestureState.x0,
      y: gestureState.y0,
      timestamp,
    });

    // Clean old touch history
    this.touchHistory = this.touchHistory.filter(
      touch => timestamp - touch.timestamp < 1000
    );
  }

  private onGestureMove(evt: GestureResponderEvent, gestureState: PanResponderGestureState) {
    if (!this.currentGesture) return;

    const touches = evt.nativeEvent.touches;
    
    // Update gesture data
    this.currentGesture.velocity = Math.sqrt(
      gestureState.vx ** 2 + gestureState.vy ** 2
    );
    this.currentGesture.distance = Math.sqrt(
      gestureState.dx ** 2 + gestureState.dy ** 2
    );

    // Detect gesture type based on movement
    if (touches.length === 1) {
      this.detectSwipeOrPan(gestureState);
    } else if (touches.length === 2) {
      this.detectPinchOrRotate(touches);
    } else if (touches.length === 3) {
      this.detectThreeFingerGesture(gestureState);
    }

    // Emit continuous gesture updates
    if (this.currentGesture.type === 'pan' || this.currentGesture.type === 'pinch') {
      this.emitGestureUpdate();
    }
  }

  private onGestureEnd(evt: GestureResponderEvent, gestureState: PanResponderGestureState) {
    if (!this.currentGesture) return;

    this.currentGesture.endPosition = {
      x: gestureState.x0 + gestureState.dx,
      y: gestureState.y0 + gestureState.dy,
    };
    this.currentGesture.duration = Date.now() - (this.touchHistory[this.touchHistory.length - 1]?.timestamp || 0);

    // Finalize gesture detection
    this.finalizeGesture(gestureState);
    
    // Check for double tap
    this.checkDoubleTap();

    this.isGestureInProgress = false;
    this.currentGesture = null;
  }

  private onGestureCancel() {
    this.isGestureInProgress = false;
    this.currentGesture = null;
    DeviceEventEmitter.emit('gesture_cancelled');
  }

  // Gesture Recognition
  private detectSwipeOrPan(gestureState: PanResponderGestureState) {
    if (!this.currentGesture) return;

    const distance = this.currentGesture.distance || 0;
    const velocity = this.currentGesture.velocity || 0;

    if (distance > this.SWIPE_THRESHOLD && velocity > this.SWIPE_VELOCITY_THRESHOLD) {
      this.currentGesture.type = 'swipe';
      this.currentGesture.direction = this.getSwipeDirection(gestureState);
    } else {
      this.currentGesture.type = 'pan';
    }
  }

  private getSwipeDirection(gestureState: PanResponderGestureState): Gesture['direction'] {
    const {dx, dy} = gestureState;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX > absY) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  private detectPinchOrRotate(touches: any[]) {
    if (!this.currentGesture || this.multiTouchPoints.length < 2) return;

    const [touch1, touch2] = touches;
    const [initial1, initial2] = this.multiTouchPoints;

    // Calculate distances
    const initialDistance = this.calculateDistance(initial1, initial2);
    const currentDistance = this.calculateDistance(
      {x: touch1.pageX, y: touch1.pageY},
      {x: touch2.pageX, y: touch2.pageY}
    );

    // Calculate angles
    const initialAngle = this.calculateAngle(initial1, initial2);
    const currentAngle = this.calculateAngle(
      {x: touch1.pageX, y: touch1.pageY},
      {x: touch2.pageX, y: touch2.pageY}
    );

    const scale = currentDistance / initialDistance;
    const rotation = currentAngle - initialAngle;

    if (Math.abs(scale - 1) > this.PINCH_THRESHOLD) {
      this.currentGesture.type = 'pinch';
      this.currentGesture.scale = scale;
    } else if (Math.abs(rotation) > this.ROTATION_THRESHOLD) {
      this.currentGesture.type = 'rotate';
      this.currentGesture.angle = rotation;
    }
  }

  private detectThreeFingerGesture(gestureState: PanResponderGestureState) {
    if (!this.currentGesture) return;

    this.currentGesture.type = 'threeFinger';
    this.currentGesture.direction = this.getSwipeDirection(gestureState);
  }

  private detectLongPress() {
    if (!this.currentGesture || this.currentGesture.distance! > 10) return;

    this.currentGesture.type = 'longPress';
    this.executeGesture(this.currentGesture as Gesture);
  }

  private checkDoubleTap() {
    const now = Date.now();
    const recentTaps = this.touchHistory.filter(
      touch => now - touch.timestamp < this.DOUBLE_TAP_DELAY
    );

    if (recentTaps.length >= 2) {
      const [tap1, tap2] = recentTaps.slice(-2);
      const distance = this.calculateDistance(tap1, tap2);

      if (distance < 30) {
        const doubleTap: Gesture = {
          type: 'doubleTap',
          fingers: 1,
          velocity: 0,
          distance: 0,
          duration: tap2.timestamp - tap1.timestamp,
          startPosition: {x: tap1.x, y: tap1.y},
          endPosition: {x: tap2.x, y: tap2.y},
        };
        this.executeGesture(doubleTap);
      }
    }
  }

  private checkEdgeGesture(x: number, y: number) {
    const screenWidth = 400; // Get from Dimensions in production
    const screenHeight = 800;

    for (const edge of this.edgeGestures) {
      let isEdge = false;

      switch (edge.edge) {
        case 'left':
          isEdge = x < edge.threshold;
          break;
        case 'right':
          isEdge = x > screenWidth - edge.threshold;
          break;
        case 'top':
          isEdge = y < edge.threshold;
          break;
        case 'bottom':
          isEdge = y > screenHeight - edge.threshold;
          break;
      }

      if (isEdge) {
        this.currentGesture!.type = 'edge';
        this.currentGesture!.direction = edge.edge as any;
        DeviceEventEmitter.emit('edge_gesture_started', edge);
        break;
      }
    }
  }

  // Gesture Execution
  private finalizeGesture(gestureState: PanResponderGestureState) {
    if (!this.currentGesture || !this.currentGesture.type) return;

    const gesture: Gesture = {
      type: this.currentGesture.type,
      direction: this.currentGesture.direction,
      fingers: this.currentGesture.fingers || 1,
      velocity: this.currentGesture.velocity || 0,
      distance: this.currentGesture.distance || 0,
      angle: this.currentGesture.angle,
      scale: this.currentGesture.scale,
      duration: this.currentGesture.duration || 0,
      startPosition: this.currentGesture.startPosition!,
      endPosition: this.currentGesture.endPosition || this.currentGesture.startPosition!,
    };

    this.executeGesture(gesture);
  }

  private executeGesture(gesture: Gesture) {
    // Find matching gesture mapping
    for (const [key, mapping] of this.gestureMappings.entries()) {
      if (mapping.gesture === gesture.type && mapping.enabled) {
        // Check additional conditions
        if (gesture.type === 'swipe' && key.includes(gesture.direction!)) {
          this.performAction(mapping.action, gesture);
          if (mapping.hapticFeedback) {
            this.triggerHapticFeedback();
          }
          break;
        } else if (gesture.type !== 'swipe') {
          this.performAction(mapping.action, gesture);
          if (mapping.hapticFeedback) {
            this.triggerHapticFeedback();
          }
          break;
        }
      }
    }

    DeviceEventEmitter.emit('gesture_recognized', gesture);
  }

  private performAction(action: string, gesture: Gesture) {
    DeviceEventEmitter.emit('gesture_action', {action, gesture});

    // Perform specific actions
    switch (action) {
      case 'navigate_back':
        DeviceEventEmitter.emit('navigation', 'back');
        break;
      case 'navigate_forward':
        DeviceEventEmitter.emit('navigation', 'forward');
        break;
      case 'refresh':
        DeviceEventEmitter.emit('refresh');
        break;
      case 'zoom':
        DeviceEventEmitter.emit('zoom', gesture.scale || 2);
        break;
      case 'switch_workspace':
        DeviceEventEmitter.emit('switch_workspace', gesture.direction);
        break;
      case 'open_drawer':
        DeviceEventEmitter.emit('open_drawer');
        break;
      case 'open_notifications':
        DeviceEventEmitter.emit('open_notifications');
        break;
    }
  }

  private emitGestureUpdate() {
    if (!this.currentGesture) return;

    DeviceEventEmitter.emit('gesture_update', {
      type: this.currentGesture.type,
      scale: this.currentGesture.scale,
      angle: this.currentGesture.angle,
      distance: this.currentGesture.distance,
    });
  }

  // Utilities
  private calculateDistance(p1: {x: number; y: number}, p2: {x: number; y: number}): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  private calculateAngle(p1: {x: number; y: number}, p2: {x: number; y: number}): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  private triggerHapticFeedback() {
    // Trigger haptic feedback (requires native module)
    DeviceEventEmitter.emit('haptic_feedback', 'impact');
  }

  // Public API
  public enableGesture(gestureKey: string): void {
    const mapping = this.gestureMappings.get(gestureKey);
    if (mapping) {
      mapping.enabled = true;
    }
  }

  public disableGesture(gestureKey: string): void {
    const mapping = this.gestureMappings.get(gestureKey);
    if (mapping) {
      mapping.enabled = false;
    }
  }

  public addCustomGesture(key: string, mapping: GestureMapping): void {
    this.gestureMappings.set(key, mapping);
  }

  public setGestureSensitivity(gestureKey: string, sensitivity: number): void {
    const mapping = this.gestureMappings.get(gestureKey);
    if (mapping) {
      mapping.sensitivity = Math.max(0.1, Math.min(2.0, sensitivity));
    }
  }

  public getGestureHistory(): Array<{x: number; y: number; timestamp: number}> {
    return this.touchHistory;
  }

  public getPanResponder(name: string = 'main'): any {
    return this.gestureRecognizers.get(name);
  }
}
