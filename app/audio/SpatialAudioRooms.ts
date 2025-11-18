// SpatialAudioRooms.ts - 3D Spatial Audio Rooms for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, DeviceEventEmitter} from 'react-native';

interface AudioRoom {
  id: string;
  name: string;
  type: 'conference' | 'concert' | 'theater' | 'lounge' | 'outdoor' | 'studio';
  capacity: number;
  participants: AudioParticipant[];
  acoustics: RoomAcoustics;
  soundSources: SoundSource[];
  ambience: AmbienceSettings;
  isLocked: boolean;
  createdBy: string;
  createdAt: Date;
}

interface AudioParticipant {
  id: string;
  name: string;
  position: Position3D;
  orientation: Orientation3D;
  audioProfile: AudioProfile;
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
  audioStream?: MediaStream;
}

interface Position3D {
  x: number; // meters
  y: number; // meters
  z: number; // meters
}

interface Orientation3D {
  azimuth: number; // degrees (0-360)
  elevation: number; // degrees (-90 to 90)
  roll: number; // degrees (-180 to 180)
}

interface AudioProfile {
  voiceFrequency: number; // Hz
  voiceColor: string; // Visual representation
  preferredVolume: number;
  noiseSupression: boolean;
  echoCancellation: boolean;
  spatialProcessing: '3d' | 'stereo' | 'mono';
}

interface RoomAcoustics {
  size: {width: number; height: number; depth: number};
  reverbTime: number; // RT60 in seconds
  absorption: number; // 0-1
  diffusion: number; // 0-1
  materials: RoomMaterial[];
  impulseResponse?: Float32Array;
}

interface RoomMaterial {
  type: 'wall' | 'floor' | 'ceiling';
  material: 'concrete' | 'wood' | 'carpet' | 'glass' | 'fabric';
  absorptionCoefficient: number;
  scatteringCoefficient: number;
}

interface SoundSource {
  id: string;
  type: 'music' | 'ambient' | 'effect' | 'notification';
  position: Position3D;
  volume: number;
  loop: boolean;
  spatial: boolean;
  url?: string;
  buffer?: AudioBuffer;
}

interface AmbienceSettings {
  enabled: boolean;
  type: 'nature' | 'city' | 'office' | 'beach' | 'rain' | 'fireplace';
  volume: number;
  dynamicTime: boolean; // Changes with time of day
}

interface AudioBuffer {
  data: Float32Array;
  sampleRate: number;
  channels: number;
  duration: number;
}

interface MediaStream {
  id: string;
  tracks: MediaStreamTrack[];
}

interface MediaStreamTrack {
  id: string;
  kind: 'audio' | 'video';
  enabled: boolean;
}

interface SpatialAudioEngine {
  context: any; // AudioContext
  panner: any; // PannerNode
  listener: any; // AudioListener
  convolver: any; // ConvolverNode for reverb
}

export class SpatialAudioRooms {
  private static instance: SpatialAudioRooms;
  private currentRoom: AudioRoom | null = null;
  private audioEngine: SpatialAudioEngine | null = null;
  private participants: Map<string, AudioParticipant> = new Map();
  private soundSources: Map<string, SoundSource> = new Map();
  private myPosition: Position3D = {x: 0, y: 0, z: 0};
  private myOrientation: Orientation3D = {azimuth: 0, elevation: 0, roll: 0};
  private isInitialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): SpatialAudioRooms {
    if (!SpatialAudioRooms.instance) {
      SpatialAudioRooms.instance = new SpatialAudioRooms();
    }
    return SpatialAudioRooms.instance;
  }

  private async initialize() {
    try {
      // Initialize Web Audio API or native audio module
      await this.initializeAudioEngine();
      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Spatial Audio:', error);
    }
  }

  private async initializeAudioEngine() {
    // In production, use Web Audio API or native module
    // this.audioEngine = await NativeModules.SpatialAudio.initialize();
    
    // Mock audio engine
    this.audioEngine = {
      context: null,
      panner: null,
      listener: null,
      convolver: null,
    };
  }

  private setupEventListeners() {
    DeviceEventEmitter.addListener('participant_moved', this.onParticipantMoved.bind(this));
    DeviceEventEmitter.addListener('participant_speaking', this.onParticipantSpeaking.bind(this));
    DeviceEventEmitter.addListener('room_acoustics_changed', this.onRoomAcousticsChanged.bind(this));
  }

  // Room Management
  public async createRoom(
    name: string,
    type: AudioRoom['type'],
    capacity: number = 50
  ): Promise<AudioRoom> {
    const room: AudioRoom = {
      id: `room_${Date.now()}`,
      name,
      type,
      capacity,
      participants: [],
      acoustics: this.getDefaultAcoustics(type),
      soundSources: [],
      ambience: this.getDefaultAmbience(type),
      isLocked: false,
      createdBy: 'Current User',
      createdAt: new Date(),
    };

    this.currentRoom = room;
    await this.configureRoomAcoustics(room.acoustics);
    
    if (room.ambience.enabled) {
      await this.startAmbience(room.ambience);
    }

    DeviceEventEmitter.emit('room_created', room);
    return room;
  }

  private getDefaultAcoustics(type: AudioRoom['type']): RoomAcoustics {
    const acousticsProfiles: Record<AudioRoom['type'], RoomAcoustics> = {
      conference: {
        size: {width: 10, height: 3, depth: 8},
        reverbTime: 0.4,
        absorption: 0.7,
        diffusion: 0.5,
        materials: [
          {type: 'wall', material: 'fabric', absorptionCoefficient: 0.6, scatteringCoefficient: 0.3},
          {type: 'floor', material: 'carpet', absorptionCoefficient: 0.8, scatteringCoefficient: 0.2},
          {type: 'ceiling', material: 'fabric', absorptionCoefficient: 0.7, scatteringCoefficient: 0.4},
        ],
      },
      concert: {
        size: {width: 50, height: 20, depth: 30},
        reverbTime: 2.0,
        absorption: 0.3,
        diffusion: 0.8,
        materials: [
          {type: 'wall', material: 'wood', absorptionCoefficient: 0.3, scatteringCoefficient: 0.6},
          {type: 'floor', material: 'wood', absorptionCoefficient: 0.2, scatteringCoefficient: 0.4},
          {type: 'ceiling', material: 'wood', absorptionCoefficient: 0.3, scatteringCoefficient: 0.7},
        ],
      },
      theater: {
        size: {width: 30, height: 15, depth: 40},
        reverbTime: 1.5,
        absorption: 0.5,
        diffusion: 0.6,
        materials: [
          {type: 'wall', material: 'fabric', absorptionCoefficient: 0.5, scatteringCoefficient: 0.4},
          {type: 'floor', material: 'carpet', absorptionCoefficient: 0.7, scatteringCoefficient: 0.2},
          {type: 'ceiling', material: 'wood', absorptionCoefficient: 0.4, scatteringCoefficient: 0.5},
        ],
      },
      lounge: {
        size: {width: 15, height: 3, depth: 15},
        reverbTime: 0.8,
        absorption: 0.6,
        diffusion: 0.4,
        materials: [
          {type: 'wall', material: 'wood', absorptionCoefficient: 0.4, scatteringCoefficient: 0.5},
          {type: 'floor', material: 'carpet', absorptionCoefficient: 0.8, scatteringCoefficient: 0.2},
          {type: 'ceiling', material: 'wood', absorptionCoefficient: 0.4, scatteringCoefficient: 0.4},
        ],
      },
      outdoor: {
        size: {width: 100, height: 50, depth: 100},
        reverbTime: 0.2,
        absorption: 0.9,
        diffusion: 0.1,
        materials: [
          {type: 'wall', material: 'concrete', absorptionCoefficient: 0.1, scatteringCoefficient: 0.1},
          {type: 'floor', material: 'concrete', absorptionCoefficient: 0.1, scatteringCoefficient: 0.1},
          {type: 'ceiling', material: 'concrete', absorptionCoefficient: 0.1, scatteringCoefficient: 0.1},
        ],
      },
      studio: {
        size: {width: 8, height: 3, depth: 10},
        reverbTime: 0.3,
        absorption: 0.85,
        diffusion: 0.7,
        materials: [
          {type: 'wall', material: 'fabric', absorptionCoefficient: 0.9, scatteringCoefficient: 0.5},
          {type: 'floor', material: 'carpet', absorptionCoefficient: 0.85, scatteringCoefficient: 0.3},
          {type: 'ceiling', material: 'fabric', absorptionCoefficient: 0.9, scatteringCoefficient: 0.6},
        ],
      },
    };

    return acousticsProfiles[type];
  }

  private getDefaultAmbience(type: AudioRoom['type']): AmbienceSettings {
    const ambienceProfiles: Record<AudioRoom['type'], AmbienceSettings> = {
      conference: {enabled: false, type: 'office', volume: 0.1, dynamicTime: false},
      concert: {enabled: true, type: 'city', volume: 0.2, dynamicTime: false},
      theater: {enabled: false, type: 'office', volume: 0.05, dynamicTime: false},
      lounge: {enabled: true, type: 'fireplace', volume: 0.3, dynamicTime: true},
      outdoor: {enabled: true, type: 'nature', volume: 0.4, dynamicTime: true},
      studio: {enabled: false, type: 'office', volume: 0, dynamicTime: false},
    };

    return ambienceProfiles[type];
  }

  // Participant Management
  public async joinRoom(roomId: string, position?: Position3D): Promise<void> {
    if (position) {
      this.myPosition = position;
    }

    const participant: AudioParticipant = {
      id: 'current_user',
      name: 'You',
      position: this.myPosition,
      orientation: this.myOrientation,
      audioProfile: {
        voiceFrequency: 150,
        voiceColor: '#8B5CF6',
        preferredVolume: 0.8,
        noiseSupression: true,
        echoCancellation: true,
        spatialProcessing: '3d',
      },
      isMuted: false,
      isSpeaking: false,
      volume: 1.0,
    };

    this.participants.set(participant.id, participant);
    
    if (this.currentRoom) {
      this.currentRoom.participants.push(participant);
    }

    await this.startAudioStreaming();
    DeviceEventEmitter.emit('joined_room', {roomId, participant});
  }

  public moveInRoom(position: Position3D): void {
    this.myPosition = position;
    this.updateListenerPosition(position);
    
    // Broadcast position to other participants
    this.broadcastPosition(position);
    
    // Update audio processing for all sources
    this.updateAllAudioSources();
  }

  public rotateInRoom(orientation: Orientation3D): void {
    this.myOrientation = orientation;
    this.updateListenerOrientation(orientation);
  }

  private updateListenerPosition(position: Position3D): void {
    if (this.audioEngine?.listener) {
      // Update Web Audio API listener position
      // this.audioEngine.listener.setPosition(position.x, position.y, position.z);
    }
    
    // Update native audio engine
    // NativeModules.SpatialAudio.setListenerPosition(position);
  }

  private updateListenerOrientation(orientation: Orientation3D): void {
    if (this.audioEngine?.listener) {
      // Convert orientation to forward and up vectors
      const forward = this.orientationToVector(orientation);
      const up = {x: 0, y: 1, z: 0};
      
      // this.audioEngine.listener.setOrientation(
      //   forward.x, forward.y, forward.z,
      //   up.x, up.y, up.z
      // );
    }
  }

  private orientationToVector(orientation: Orientation3D): Position3D {
    const azimuthRad = orientation.azimuth * Math.PI / 180;
    const elevationRad = orientation.elevation * Math.PI / 180;
    
    return {
      x: Math.cos(elevationRad) * Math.sin(azimuthRad),
      y: Math.sin(elevationRad),
      z: Math.cos(elevationRad) * Math.cos(azimuthRad),
    };
  }

  // Audio Processing
  private async configureRoomAcoustics(acoustics: RoomAcoustics): Promise<void> {
    // Calculate impulse response based on room properties
    const impulseResponse = this.calculateImpulseResponse(acoustics);
    
    if (this.audioEngine?.convolver) {
      // Apply impulse response to convolver
      // this.audioEngine.convolver.buffer = impulseResponse;
    }
    
    // Configure native audio engine
    // await NativeModules.SpatialAudio.setRoomAcoustics(acoustics);
  }

  private calculateImpulseResponse(acoustics: RoomAcoustics): Float32Array {
    // Simplified impulse response calculation
    const sampleRate = 48000;
    const duration = acoustics.reverbTime;
    const samples = Math.floor(sampleRate * duration);
    const impulse = new Float32Array(samples);
    
    // Generate exponentially decaying noise
    for (let i = 0; i < samples; i++) {
      const decay = Math.exp(-3 * i / samples);
      impulse[i] = (Math.random() * 2 - 1) * decay * (1 - acoustics.absorption);
    }
    
    return impulse;
  }

  public processAudioStream(
    stream: MediaStream,
    participant: AudioParticipant
  ): MediaStream {
    // Apply spatial audio processing
    const processedStream = this.applySpatialProcessing(stream, participant);
    
    // Apply room acoustics
    const acousticStream = this.applyRoomAcoustics(processedStream);
    
    // Apply distance attenuation
    const attenuatedStream = this.applyDistanceAttenuation(acousticStream, participant);
    
    return attenuatedStream;
  }

  private applySpatialProcessing(
    stream: MediaStream,
    participant: AudioParticipant
  ): MediaStream {
    // Calculate relative position
    const relativePos = {
      x: participant.position.x - this.myPosition.x,
      y: participant.position.y - this.myPosition.y,
      z: participant.position.z - this.myPosition.z,
    };
    
    // Calculate azimuth and elevation
    const distance = Math.sqrt(relativePos.x ** 2 + relativePos.y ** 2 + relativePos.z ** 2);
    const azimuth = Math.atan2(relativePos.x, relativePos.z) * 180 / Math.PI;
    const elevation = Math.asin(relativePos.y / distance) * 180 / Math.PI;
    
    // Apply HRTF (Head-Related Transfer Function)
    // In production, use actual HRTF data
    // const hrtfStream = this.applyHRTF(stream, azimuth, elevation);
    
    return stream;
  }

  private applyRoomAcoustics(stream: MediaStream): MediaStream {
    if (!this.currentRoom) return stream;
    
    // Apply reverb based on room acoustics
    // const reverbStream = this.applyReverb(stream, this.currentRoom.acoustics.reverbTime);
    
    // Apply early reflections
    // const reflectedStream = this.applyReflections(reverbStream, this.currentRoom.acoustics);
    
    return stream;
  }

  private applyDistanceAttenuation(
    stream: MediaStream,
    participant: AudioParticipant
  ): MediaStream {
    const distance = this.calculateDistance(participant.position, this.myPosition);
    
    // Inverse square law with modifications for room acoustics
    const attenuation = 1 / (1 + distance * distance * 0.1);
    
    // Apply volume adjustment
    // stream.volume = stream.volume * attenuation;
    
    return stream;
  }

  private calculateDistance(pos1: Position3D, pos2: Position3D): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Sound Sources
  public async addSoundSource(
    type: SoundSource['type'],
    position: Position3D,
    url?: string
  ): Promise<SoundSource> {
    const source: SoundSource = {
      id: `source_${Date.now()}`,
      type,
      position,
      volume: 0.5,
      loop: type === 'ambient' || type === 'music',
      spatial: true,
      url,
    };

    this.soundSources.set(source.id, source);
    
    if (this.currentRoom) {
      this.currentRoom.soundSources.push(source);
    }

    await this.playSound(source);
    return source;
  }

  private async playSound(source: SoundSource): Promise<void> {
    // Load and play audio
    // const audio = await this.loadAudio(source.url);
    // this.processSpatialSound(audio, source.position);
  }

  // Ambience
  private async startAmbience(settings: AmbienceSettings): Promise<void> {
    if (!settings.enabled) return;
    
    const ambienceUrl = this.getAmbienceUrl(settings.type);
    await this.addSoundSource('ambient', {x: 0, y: 0, z: 0}, ambienceUrl);
    
    if (settings.dynamicTime) {
      this.scheduleDynamicAmbience(settings);
    }
  }

  private getAmbienceUrl(type: AmbienceSettings['type']): string {
    const urls: Record<AmbienceSettings['type'], string> = {
      nature: 'sounds/nature.mp3',
      city: 'sounds/city.mp3',
      office: 'sounds/office.mp3',
      beach: 'sounds/beach.mp3',
      rain: 'sounds/rain.mp3',
      fireplace: 'sounds/fireplace.mp3',
    };
    return urls[type];
  }

  private scheduleDynamicAmbience(settings: AmbienceSettings): void {
    // Change ambience based on time of day
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      settings.type = 'nature'; // Morning
    } else if (hour >= 12 && hour < 18) {
      settings.type = 'office'; // Afternoon
    } else if (hour >= 18 && hour < 22) {
      settings.type = 'fireplace'; // Evening
    } else {
      settings.type = 'rain'; // Night
    }
    
    // Schedule next check
    setTimeout(() => this.scheduleDynamicAmbience(settings), 3600000); // 1 hour
  }

  // Communication
  private async startAudioStreaming(): Promise<void> {
    // Start capturing and streaming audio
    // const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    // this.processAndTransmitAudio(stream);
  }

  private broadcastPosition(position: Position3D): void {
    DeviceEventEmitter.emit('position_update', {
      userId: 'current_user',
      position,
    });
  }

  private updateAllAudioSources(): void {
    // Recalculate audio for all participants
    this.participants.forEach((participant) => {
      if (participant.audioStream) {
        this.processAudioStream(participant.audioStream, participant);
      }
    });
    
    // Recalculate audio for all sound sources
    this.soundSources.forEach((source) => {
      // Update spatial processing for source
    });
  }

  // Event Handlers
  private onParticipantMoved(data: {userId: string; position: Position3D}): void {
    const participant = this.participants.get(data.userId);
    if (participant) {
      participant.position = data.position;
      if (participant.audioStream) {
        this.processAudioStream(participant.audioStream, participant);
      }
    }
  }

  private onParticipantSpeaking(data: {userId: string; isSpeaking: boolean}): void {
    const participant = this.participants.get(data.userId);
    if (participant) {
      participant.isSpeaking = data.isSpeaking;
      DeviceEventEmitter.emit('participant_speaking_changed', data);
    }
  }

  private onRoomAcousticsChanged(acoustics: RoomAcoustics): void {
    if (this.currentRoom) {
      this.currentRoom.acoustics = acoustics;
      this.configureRoomAcoustics(acoustics);
    }
  }

  // Public API
  public getCurrentRoom(): AudioRoom | null {
    return this.currentRoom;
  }

  public getParticipants(): AudioParticipant[] {
    return Array.from(this.participants.values());
  }

  public async leaveRoom(): Promise<void> {
    this.currentRoom = null;
    this.participants.clear();
    this.soundSources.clear();
    
    DeviceEventEmitter.emit('left_room');
  }

  public async saveRoom(room: AudioRoom): Promise<void> {
    try {
      const rooms = await this.getSavedRooms();
      rooms.push(room);
      await AsyncStorage.setItem('spatial_audio_rooms', JSON.stringify(rooms));
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  }

  public async getSavedRooms(): Promise<AudioRoom[]> {
    try {
      const saved = await AsyncStorage.getItem('spatial_audio_rooms');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load rooms:', error);
      return [];
    }
  }
}
