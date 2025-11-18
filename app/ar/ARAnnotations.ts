// ARAnnotations.ts - Augmented Reality Annotations System for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, NativeEventEmitter, DeviceEventEmitter} from 'react-native';

interface ARAnnotation {
  id: string;
  type: 'text' | 'arrow' | 'highlight' | 'model' | 'measurement' | 'waypoint' | 'drawing';
  content: string;
  position: ARPosition;
  anchor?: ARAnchor;
  style: ARStyle;
  author: string;
  createdAt: Date;
  isLocked: boolean;
  visibility: 'public' | 'private' | 'team';
  metadata?: any;
  interactions?: ARInteraction[];
}

interface ARPosition {
  x: number;
  y: number;
  z: number;
  orientation?: {x: number; y: number; z: number; w: number};
}

interface ARAnchor {
  id: string;
  type: 'plane' | 'point' | 'image' | 'object' | 'face' | 'geo';
  transform: number[];
  confidence: number;
  trackingState: 'tracking' | 'paused' | 'stopped';
}

interface ARStyle {
  color: string;
  fontSize?: number;
  lineWidth?: number;
  opacity: number;
  scale: number;
  animation?: 'pulse' | 'rotate' | 'bounce' | 'float' | 'none';
  material?: 'standard' | 'metallic' | 'glass' | 'neon';
}

interface ARInteraction {
  type: 'tap' | 'hover' | 'proximity' | 'gaze';
  action: 'navigate' | 'expand' | 'play' | 'custom';
  data?: any;
}

interface ARPlane {
  id: string;
  type: 'horizontal' | 'vertical';
  center: ARPosition;
  extent: {width: number; height: number};
  vertices: ARPosition[];
  classification?: 'floor' | 'wall' | 'ceiling' | 'table' | 'seat';
}

interface ARObject {
  id: string;
  name: string;
  category: string;
  boundingBox: BoundingBox;
  confidence: number;
  features: ObjectFeatures;
}

interface BoundingBox {
  min: ARPosition;
  max: ARPosition;
  center: ARPosition;
  size: {width: number; height: number; depth: number};
}

interface ObjectFeatures {
  color?: string;
  texture?: string;
  material?: string;
  keywords: string[];
}

interface ARSession {
  id: string;
  isActive: boolean;
  trackingState: 'normal' | 'limited' | 'unavailable';
  lightEstimate?: LightEstimate;
  worldMap?: WorldMap;
  anchors: ARAnchor[];
  planes: ARPlane[];
  objects: ARObject[];
}

interface LightEstimate {
  ambientIntensity: number;
  ambientColorTemperature: number;
  primaryLightDirection?: ARPosition;
  primaryLightIntensity?: number;
}

interface WorldMap {
  id: string;
  data: any;
  anchors: string[];
  timestamp: Date;
}

interface CloudAnchor {
  id: string;
  cloudId: string;
  localAnchor: ARAnchor;
  expirationDate: Date;
  shareCode: string;
}

export class ARAnnotationsManager {
  private static instance: ARAnnotationsManager;
  private session: ARSession | null = null;
  private annotations: Map<string, ARAnnotation> = new Map();
  private cloudAnchors: Map<string, CloudAnchor> = new Map();
  private eventEmitter: NativeEventEmitter | null = null;
  private isInitialized: boolean = false;
  private collaborators: Map<string, {position: ARPosition; color: string}> = new Map();

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ARAnnotationsManager {
    if (!ARAnnotationsManager.instance) {
      ARAnnotationsManager.instance = new ARAnnotationsManager();
    }
    return ARAnnotationsManager.instance;
  }

  private async initialize() {
    try {
      // Initialize AR module
      // this.eventEmitter = new NativeEventEmitter(NativeModules.ARModule);
      this.setupEventListeners();
      await this.loadSavedAnnotations();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AR Annotations:', error);
    }
  }

  private setupEventListeners() {
    // Listen for AR events
    DeviceEventEmitter.addListener('onPlaneDetected', this.onPlaneDetected.bind(this));
    DeviceEventEmitter.addListener('onObjectDetected', this.onObjectDetected.bind(this));
    DeviceEventEmitter.addListener('onTrackingStateChanged', this.onTrackingStateChanged.bind(this));
    DeviceEventEmitter.addListener('onLightEstimateChanged', this.onLightEstimateChanged.bind(this));
  }

  // Session Management
  public async startSession(): Promise<ARSession> {
    if (this.session?.isActive) {
      return this.session;
    }

    this.session = {
      id: `session_${Date.now()}`,
      isActive: true,
      trackingState: 'normal',
      anchors: [],
      planes: [],
      objects: [],
    };

    // Start native AR session
    // await NativeModules.ARModule.startSession();

    DeviceEventEmitter.emit('ar_session_started', this.session);
    return this.session;
  }

  public async pauseSession(): Promise<void> {
    if (!this.session) return;
    
    this.session.isActive = false;
    // await NativeModules.ARModule.pauseSession();
    
    DeviceEventEmitter.emit('ar_session_paused');
  }

  public async stopSession(): Promise<void> {
    if (!this.session) return;
    
    await this.saveWorldMap();
    this.session = null;
    this.annotations.clear();
    
    // await NativeModules.ARModule.stopSession();
    DeviceEventEmitter.emit('ar_session_stopped');
  }

  // Annotation Management
  public async createAnnotation(
    type: ARAnnotation['type'],
    position: ARPosition,
    content: string,
    style?: Partial<ARStyle>
  ): Promise<ARAnnotation> {
    const annotation: ARAnnotation = {
      id: `ann_${Date.now()}`,
      type,
      content,
      position,
      style: {
        color: '#8B5CF6',
        opacity: 1,
        scale: 1,
        animation: type === 'text' ? 'float' : 'none',
        material: 'standard',
        ...style,
      },
      author: 'Current User',
      createdAt: new Date(),
      isLocked: false,
      visibility: 'team',
    };

    // Try to anchor to detected planes or objects
    const anchor = await this.createAnchor(position);
    if (anchor) {
      annotation.anchor = anchor;
    }

    this.annotations.set(annotation.id, annotation);
    
    // Broadcast to collaborators
    this.broadcastAnnotation(annotation);
    
    // Save locally
    await this.saveAnnotation(annotation);
    
    DeviceEventEmitter.emit('annotation_created', annotation);
    return annotation;
  }

  private async createAnchor(position: ARPosition): Promise<ARAnchor | null> {
    // Perform hit test to find anchor point
    const hitResult = await this.performHitTest(position);
    
    if (hitResult) {
      const anchor: ARAnchor = {
        id: `anchor_${Date.now()}`,
        type: hitResult.type,
        transform: hitResult.transform,
        confidence: hitResult.confidence,
        trackingState: 'tracking',
      };
      
      if (this.session) {
        this.session.anchors.push(anchor);
      }
      
      return anchor;
    }
    
    return null;
  }

  private async performHitTest(position: ARPosition): Promise<any> {
    // Perform AR hit test
    // const result = await NativeModules.ARModule.hitTest(position);
    
    // Simulated hit test
    const nearestPlane = this.findNearestPlane(position);
    if (nearestPlane) {
      return {
        type: 'plane',
        transform: this.calculateTransform(position, nearestPlane),
        confidence: 0.95,
      };
    }
    
    return null;
  }

  private findNearestPlane(position: ARPosition): ARPlane | null {
    if (!this.session) return null;
    
    let nearest: ARPlane | null = null;
    let minDistance = Infinity;
    
    for (const plane of this.session.planes) {
      const distance = this.calculateDistance(position, plane.center);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = plane;
      }
    }
    
    return minDistance < 2 ? nearest : null; // Within 2 meters
  }

  private calculateDistance(p1: ARPosition, p2: ARPosition): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private calculateTransform(position: ARPosition, plane: ARPlane): number[] {
    // Calculate transform matrix
    // Simplified 4x4 transform matrix
    return [
      1, 0, 0, position.x,
      0, 1, 0, position.y,
      0, 0, 1, position.z,
      0, 0, 0, 1,
    ];
  }

  // Object Detection
  public async detectObjects(image?: any): Promise<ARObject[]> {
    // Use ML model to detect objects
    // const objects = await NativeModules.ARModule.detectObjects(image);
    
    // Simulated object detection
    const objects: ARObject[] = [
      {
        id: 'obj_1',
        name: 'Table',
        category: 'furniture',
        boundingBox: {
          min: {x: -1, y: 0, z: -2},
          max: {x: 1, y: 0.8, z: -1},
          center: {x: 0, y: 0.4, z: -1.5},
          size: {width: 2, height: 0.8, depth: 1},
        },
        confidence: 0.92,
        features: {
          color: 'brown',
          material: 'wood',
          keywords: ['table', 'furniture', 'desk'],
        },
      },
    ];
    
    if (this.session) {
      this.session.objects = objects;
    }
    
    return objects;
  }

  // Measurement
  public async measureDistance(point1: ARPosition, point2: ARPosition): Promise<number> {
    const distance = this.calculateDistance(point1, point2);
    
    // Create measurement annotation
    await this.createAnnotation(
      'measurement',
      {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2,
        z: (point1.z + point2.z) / 2,
      },
      `${distance.toFixed(2)}m`,
      {
        color: '#14B8A6',
        material: 'neon',
      }
    );
    
    return distance;
  }

  public async measureArea(points: ARPosition[]): Promise<number> {
    if (points.length < 3) return 0;
    
    // Calculate polygon area using shoelace formula
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].z;
      area -= points[j].x * points[i].z;
    }
    
    area = Math.abs(area) / 2;
    
    // Create area annotation
    const center = this.calculateCentroid(points);
    await this.createAnnotation(
      'text',
      center,
      `${area.toFixed(2)}m²`,
      {
        color: '#F59E0B',
        scale: 1.5,
      }
    );
    
    return area;
  }

  private calculateCentroid(points: ARPosition[]): ARPosition {
    const sum = points.reduce(
      (acc, p) => ({x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z}),
      {x: 0, y: 0, z: 0}
    );
    
    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
      z: sum.z / points.length,
    };
  }

  // Cloud Anchors (for multi-user AR)
  public async createCloudAnchor(anchor: ARAnchor): Promise<CloudAnchor> {
    // Upload anchor to cloud
    // const cloudId = await NativeModules.ARModule.hostCloudAnchor(anchor);
    
    const cloudAnchor: CloudAnchor = {
      id: `cloud_${Date.now()}`,
      cloudId: `cloud_anchor_${Date.now()}`,
      localAnchor: anchor,
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      shareCode: this.generateShareCode(),
    };
    
    this.cloudAnchors.set(cloudAnchor.id, cloudAnchor);
    return cloudAnchor;
  }

  public async resolveCloudAnchor(shareCode: string): Promise<ARAnchor | null> {
    // Resolve cloud anchor by share code
    // const anchor = await NativeModules.ARModule.resolveCloudAnchor(shareCode);
    
    // Find in local cloud anchors
    for (const cloudAnchor of this.cloudAnchors.values()) {
      if (cloudAnchor.shareCode === shareCode) {
        return cloudAnchor.localAnchor;
      }
    }
    
    return null;
  }

  private generateShareCode(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Collaboration
  public async joinCollaborativeSession(sessionId: string): Promise<void> {
    // Connect to collaborative AR session
    // WebSocket or WebRTC connection
    
    DeviceEventEmitter.emit('collaborative_session_joined', sessionId);
  }

  public async shareAnnotation(annotationId: string): Promise<string> {
    const annotation = this.annotations.get(annotationId);
    if (!annotation) throw new Error('Annotation not found');
    
    // Create cloud anchor for annotation
    if (annotation.anchor) {
      const cloudAnchor = await this.createCloudAnchor(annotation.anchor);
      return cloudAnchor.shareCode;
    }
    
    return '';
  }

  private broadcastAnnotation(annotation: ARAnnotation): void {
    // Broadcast to other users in session
    DeviceEventEmitter.emit('broadcast_annotation', annotation);
  }

  public onRemoteAnnotationReceived(annotation: ARAnnotation): void {
    this.annotations.set(annotation.id, annotation);
    DeviceEventEmitter.emit('remote_annotation_received', annotation);
  }

  // Persistence
  private async saveAnnotation(annotation: ARAnnotation): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('ar_annotations');
      const annotations = saved ? JSON.parse(saved) : [];
      annotations.push(annotation);
      await AsyncStorage.setItem('ar_annotations', JSON.stringify(annotations));
    } catch (error) {
      console.error('Failed to save annotation:', error);
    }
  }

  private async loadSavedAnnotations(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('ar_annotations');
      if (saved) {
        const annotations = JSON.parse(saved);
        annotations.forEach((ann: ARAnnotation) => {
          this.annotations.set(ann.id, ann);
        });
      }
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }

  private async saveWorldMap(): Promise<void> {
    if (!this.session) return;
    
    const worldMap: WorldMap = {
      id: `map_${Date.now()}`,
      data: {}, // Serialized world map data
      anchors: this.session.anchors.map(a => a.id),
      timestamp: new Date(),
    };
    
    this.session.worldMap = worldMap;
    
    try {
      await AsyncStorage.setItem('ar_world_map', JSON.stringify(worldMap));
    } catch (error) {
      console.error('Failed to save world map:', error);
    }
  }

  public async loadWorldMap(): Promise<WorldMap | null> {
    try {
      const saved = await AsyncStorage.getItem('ar_world_map');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load world map:', error);
      return null;
    }
  }

  // Event Handlers
  private onPlaneDetected(plane: ARPlane): void {
    if (this.session) {
      this.session.planes.push(plane);
      DeviceEventEmitter.emit('plane_detected', plane);
    }
  }

  private onObjectDetected(object: ARObject): void {
    if (this.session) {
      this.session.objects.push(object);
      DeviceEventEmitter.emit('object_detected', object);
    }
  }

  private onTrackingStateChanged(state: ARSession['trackingState']): void {
    if (this.session) {
      this.session.trackingState = state;
      DeviceEventEmitter.emit('tracking_state_changed', state);
    }
  }

  private onLightEstimateChanged(estimate: LightEstimate): void {
    if (this.session) {
      this.session.lightEstimate = estimate;
      DeviceEventEmitter.emit('light_estimate_changed', estimate);
    }
  }

  // Utility Methods
  public getAnnotations(): ARAnnotation[] {
    return Array.from(this.annotations.values());
  }

  public getAnnotation(id: string): ARAnnotation | undefined {
    return this.annotations.get(id);
  }

  public updateAnnotation(id: string, updates: Partial<ARAnnotation>): void {
    const annotation = this.annotations.get(id);
    if (annotation) {
      Object.assign(annotation, updates);
      this.broadcastAnnotation(annotation);
    }
  }

  public deleteAnnotation(id: string): void {
    this.annotations.delete(id);
    DeviceEventEmitter.emit('annotation_deleted', id);
  }

  public getSession(): ARSession | null {
    return this.session;
  }

  public isARSupported(): boolean {
    // Check if AR is supported on device
    // return NativeModules.ARModule?.isSupported() || false;
    return true; // Mock
  }
}
