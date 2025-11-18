// CrossPlatformSync.ts - Cross-Platform Synchronization for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, DeviceEventEmitter, NativeModules} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface SyncProfile {
  userId: string;
  devices: Device[];
  lastSync: Date;
  preferences: UserPreferences;
  syncEnabled: boolean;
  lastHandoffActivity?: HandoffData;
}

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'web' | 'watch';
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'web';
  lastSeen: Date;
  isActive: boolean;
  capabilities: string[];
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
}

interface SyncData {
  id: string;
  type: 'message' | 'file' | 'setting' | 'task' | 'note' | 'clipboard';
  data: any;
  timestamp: Date;
  deviceId: string;
  checksum: string;
  version: number;
}

interface SyncQueue {
  pending: SyncData[];
  inProgress: SyncData[];
  failed: SyncData[];
  completed: string[];
}

interface ConflictResolution {
  strategy: 'latest' | 'merge' | 'manual' | 'device-priority';
  priority: string[];
  autoResolve: boolean;
}

interface UserPreferences {
  syncFrequency: 'realtime' | 'periodic' | 'manual';
  syncInterval?: number;
  syncOnWifi: boolean;
  syncInBackground: boolean;
  dataTypes: string[];
  conflictResolution: ConflictResolution;
  autoContinueHandoff?: boolean;
  autoPasteClipboard?: boolean;
}

interface HandoffData {
  activityType: string;
  userInfo: any;
  webpageURL?: string;
  eligibleForHandoff: boolean;
  eligibleForSearch: boolean;
  eligibleForPublicIndexing: boolean;
  deviceId?: string;
  timestamp?: number;
  continuedAt?: number;
  continuedOnDevice?: string;
}

export class CrossPlatformSync {
  private static instance: CrossPlatformSync;
  private profile: SyncProfile;
  private syncQueue: SyncQueue;
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private websocket: WebSocket | null = null;
  private syncTimer: any = null;
  private conflictResolver: ConflictResolution;
  private currentDevice: Device;
  private cloudEndpoint: string = 'wss://sync.metr.app';
  private encryptionKey: string = '';
  
  private constructor() {
    this.profile = this.getDefaultProfile();
    this.syncQueue = {
      pending: [],
      inProgress: [],
      failed: [],
      completed: [],
    };
    this.conflictResolver = {
      strategy: 'latest',
      priority: [],
      autoResolve: true,
    };
    this.currentDevice = this.getCurrentDevice();
    this.initialize();
  }

  public static getInstance(): CrossPlatformSync {
    if (!CrossPlatformSync.instance) {
      CrossPlatformSync.instance = new CrossPlatformSync();
    }
    return CrossPlatformSync.instance;
  }

  private async initialize() {
    // Load sync profile
    await this.loadProfile();
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
    
    // Connect to sync server
    await this.connectToSyncServer();
    
    // Start sync based on preferences
    this.startSync();
    
    // Setup platform-specific features
    this.setupPlatformFeatures();
  }

  private getDefaultProfile(): SyncProfile {
    return {
      userId: 'user_default',
      devices: [],
      lastSync: new Date(),
      preferences: {
        syncFrequency: 'realtime',
        syncOnWifi: true,
        syncInBackground: true,
        dataTypes: ['message', 'file', 'setting', 'task', 'note', 'clipboard'],
        conflictResolution: {
          strategy: 'latest',
          priority: [],
          autoResolve: true,
        },
      },
      syncEnabled: true,
    };
  }

  private getCurrentDevice(): Device {
    return {
      id: `device_${Platform.OS}_${Date.now()}`,
      name: `${Platform.OS} Device`,
      type: Platform.isPad ? 'tablet' : 'mobile',
      platform: Platform.OS as any,
      lastSeen: new Date(),
      isActive: true,
      capabilities: this.getDeviceCapabilities(),
      syncStatus: 'pending',
    };
  }

  private getDeviceCapabilities(): string[] {
    const capabilities = ['sync', 'notifications'];
    
    if (Platform.OS === 'ios') {
      capabilities.push('handoff', 'universal-clipboard', 'airdrop', 'widgets');
    }
    if (Platform.OS === 'android') {
      capabilities.push('nearby-share', 'bubbles', 'quick-settings');
    }
    
    return capabilities;
  }

  private async loadProfile() {
    try {
      const saved = await AsyncStorage.getItem('sync_profile');
      if (saved) {
        this.profile = JSON.parse(saved);
      }
      
      // Load encryption key
      const key = await AsyncStorage.getItem('sync_encryption_key');
      if (key) {
        this.encryptionKey = key;
      } else {
        this.encryptionKey = this.generateEncryptionKey();
        await AsyncStorage.setItem('sync_encryption_key', this.encryptionKey);
      }
    } catch (error) {
      console.error('Failed to load sync profile:', error);
    }
  }

  private generateEncryptionKey(): string {
    // Generate a secure encryption key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  private setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected || false;
      
      if (this.isOnline) {
        this.processPendingSync();
      }
      
      DeviceEventEmitter.emit('sync_network_changed', {
        online: this.isOnline,
      });
    });
  }

  private async connectToSyncServer() {
    if (!this.isOnline) return;
    
    try {
      this.websocket = new WebSocket(this.cloudEndpoint);
      
      this.websocket.onopen = () => {
        console.log('Connected to sync server');
        this.registerDevice();
        this.currentDevice.syncStatus = 'synced';
      };
      
      this.websocket.onmessage = (event) => {
        this.handleSyncMessage(JSON.parse(event.data));
      };
      
      this.websocket.onerror = (error) => {
        console.error('Sync server error:', error);
        this.currentDevice.syncStatus = 'error';
      };
      
      this.websocket.onclose = () => {
        console.log('Disconnected from sync server');
        // Reconnect after delay
        setTimeout(() => this.connectToSyncServer(), 5000);
      };
    } catch (error) {
      console.error('Failed to connect to sync server:', error);
    }
  }

  private registerDevice() {
    if (!this.websocket) return;
    
    this.websocket.send(JSON.stringify({
      type: 'register',
      device: this.currentDevice,
      userId: this.profile.userId,
    }));
  }

  private handleSyncMessage(message: any) {
    switch (message.type) {
      case 'sync_data':
        this.receiveSyncData(message.data);
        break;
        
      case 'device_list':
        this.updateDeviceList(message.devices);
        break;
        
      case 'conflict':
        this.resolveConflict(message.conflict);
        break;
        
      case 'handoff':
        this.handleHandoff(message.handoff);
        break;
        
      case 'clipboard':
        this.handleUniversalClipboard(message.clipboard);
        break;
    }
  }

  private startSync() {
    switch (this.profile.preferences.syncFrequency) {
      case 'realtime':
        // Already connected via WebSocket
        break;
        
      case 'periodic':
        const interval = this.profile.preferences.syncInterval || 300000; // 5 minutes default
        this.syncTimer = setInterval(() => this.performSync(), interval);
        break;
        
      case 'manual':
        // User triggers sync manually
        break;
    }
  }

  // Public API

  public async performSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    DeviceEventEmitter.emit('sync_started');
    
    try {
      // Upload local changes
      await this.uploadChanges();
      
      // Download remote changes
      await this.downloadChanges();
      
      // Update last sync time
      this.profile.lastSync = new Date();
      await this.saveProfile();
      
      DeviceEventEmitter.emit('sync_completed', {
        timestamp: this.profile.lastSync,
      });
    } catch (error) {
      console.error('Sync failed:', error);
      DeviceEventEmitter.emit('sync_failed', {error});
    } finally {
      this.isSyncing = false;
    }
  }

  private async uploadChanges() {
    const changes = await this.getLocalChanges();
    
    for (const change of changes) {
      const encrypted = this.encryptData(change);
      this.sendSyncData(encrypted);
    }
  }

  private async downloadChanges() {
    if (!this.websocket) return;
    
    this.websocket.send(JSON.stringify({
      type: 'get_changes',
      since: this.profile.lastSync,
      deviceId: this.currentDevice.id,
    }));
  }

  private async getLocalChanges(): Promise<SyncData[]> {
    const changes: SyncData[] = [];
    
    // Get changes for each data type
    for (const dataType of this.profile.preferences.dataTypes) {
      const typeChanges = await this.getChangesForType(dataType);
      changes.push(...typeChanges);
    }
    
    return changes;
  }

  private async getChangesForType(type: string): Promise<SyncData[]> {
    const lastSync = this.profile.lastSync.getTime();
    const changes: SyncData[] = [];
    
    try {
      const data = await AsyncStorage.getItem(`sync_${type}_data`);
      if (data) {
        const items = JSON.parse(data);
        const newItems = items.filter((item: any) => 
          item.timestamp > lastSync
        );
        
        newItems.forEach((item: any) => {
          changes.push({
            id: `sync_${Date.now()}_${Math.random()}`,
            type: type as any,
            data: item,
            timestamp: new Date(),
            deviceId: this.currentDevice.id,
            checksum: this.calculateChecksum(item),
            version: 1,
          });
        });
      }
    } catch (error) {
      console.error(`Failed to get changes for ${type}:`, error);
    }
    
    return changes;
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private encryptData(data: SyncData): any {
    // Simplified encryption - in production use proper encryption
    const encrypted = {
      ...data,
      data: btoa(JSON.stringify(data.data)),
    };
    return encrypted;
  }

  private decryptData(encrypted: any): SyncData {
    // Simplified decryption
    const decrypted = {
      ...encrypted,
      data: JSON.parse(atob(encrypted.data)),
    };
    return decrypted;
  }

  private sendSyncData(data: any) {
    if (!this.websocket) {
      this.syncQueue.pending.push(data);
      return;
    }
    
    this.websocket.send(JSON.stringify({
      type: 'sync_data',
      data,
    }));
  }

  private async receiveSyncData(encrypted: any) {
    const data = this.decryptData(encrypted);
    
    // Check for conflicts
    const hasConflict = await this.checkForConflict(data);
    
    if (hasConflict) {
      const resolved = await this.resolveConflict(data);
      if (!resolved) return;
    }
    
    // Apply data locally
    await this.applyData(data);
    
    DeviceEventEmitter.emit('sync_data_received', {
      type: data.type,
      deviceId: data.deviceId,
    });
  }

  private async checkForConflict(data: SyncData): Promise<boolean> {
    try {
      const localData = await AsyncStorage.getItem(`${data.type}_${data.id}`);
      if (!localData) return false;
      
      const local = JSON.parse(localData);
      return local.version >= data.version && 
             local.checksum !== data.checksum;
    } catch (error) {
      return false;
    }
  }

  private async resolveConflict(data: any): Promise<boolean> {
    switch (this.conflictResolver.strategy) {
      case 'latest':
        // Use the latest timestamp
        const localData = await AsyncStorage.getItem(`${data.type}_${data.id}`);
        if (localData) {
          const local = JSON.parse(localData);
          return data.timestamp > local.timestamp;
        }
        return true;
        
      case 'merge':
        // Attempt to merge changes
        await this.mergeData(data);
        return true;
        
      case 'manual':
        // Ask user to resolve
        DeviceEventEmitter.emit('sync_conflict', {data});
        return false;
        
      case 'device-priority':
        // Check device priority
        const priority = this.conflictResolver.priority.indexOf(data.deviceId);
        const currentPriority = this.conflictResolver.priority.indexOf(this.currentDevice.id);
        return priority < currentPriority;
    }
  }

  private async mergeData(remoteData: SyncData) {
    // Implement merge logic based on data type
    // This is simplified - real implementation would be more complex
    const localData = await AsyncStorage.getItem(`${remoteData.type}_${remoteData.id}`);
    if (!localData) {
      await this.applyData(remoteData);
      return;
    }
    
    const local = JSON.parse(localData);
    const merged = {...local, ...remoteData.data};
    
    await AsyncStorage.setItem(
      `${remoteData.type}_${remoteData.id}`,
      JSON.stringify(merged)
    );
  }

  private async applyData(data: SyncData) {
    await AsyncStorage.setItem(
      `${data.type}_${data.id}`,
      JSON.stringify(data)
    );
    
    // Update type-specific storage
    const typeData = await AsyncStorage.getItem(`sync_${data.type}_data`);
    const items = typeData ? JSON.parse(typeData) : [];
    items.push(data.data);
    await AsyncStorage.setItem(`sync_${data.type}_data`, JSON.stringify(items));
  }

  private updateDeviceList(devices: Device[]) {
    this.profile.devices = devices;
    this.saveProfile();
    
    DeviceEventEmitter.emit('sync_devices_updated', {devices});
  }

  private async processPendingSync() {
    if (this.syncQueue.pending.length === 0) return;
    
    const pending = [...this.syncQueue.pending];
    this.syncQueue.pending = [];
    this.syncQueue.inProgress = pending;
    
    for (const data of pending) {
      try {
        this.sendSyncData(data);
        this.syncQueue.completed.push(data.id);
      } catch (error) {
        this.syncQueue.failed.push(data);
      }
    }
    
    this.syncQueue.inProgress = [];
  }

  private setupPlatformFeatures() {
    if (Platform.OS === 'ios') {
      this.setupIOSFeatures();
    } else if (Platform.OS === 'android') {
      this.setupAndroidFeatures();
    }
  }

  private setupIOSFeatures() {
    // Setup Handoff
    this.setupHandoff();
    
    // Setup Universal Clipboard
    this.setupUniversalClipboard();
    
    // Setup Continuity Camera
    this.setupContinuityCamera();
  }

  private setupAndroidFeatures() {
    // Setup Nearby Share
    this.setupNearbyShare();
    
    // Setup App Continuity
    this.setupAppContinuity();
  }

  // iOS Handoff - Enhanced Implementation
  private setupHandoff() {
    // Setup Handoff listeners
    DeviceEventEmitter.addListener('handoff_available', (activity) => {
      this.continueActivity(activity);
    });
    
    // Monitor app state changes for automatic handoff
    DeviceEventEmitter.addListener('app_state_changed', (state) => {
      if (state === 'background' && this.currentHandoffActivity) {
        this.broadcastHandoffActivity();
      }
    });
  }

  public startHandoffActivity(activity: HandoffData): void {
    if (Platform.OS !== 'ios') {
      console.warn('Handoff is only available on iOS');
      return;
    }
    
    // Validate activity data
    if (!activity.activityType || !activity.userInfo) {
      throw new Error('Invalid handoff activity data');
    }
    
    // Store current activity
    this.currentHandoffActivity = {
      ...activity,
      deviceId: this.currentDevice.id,
      timestamp: Date.now(),
    };
    
    // Send to other devices via sync server
    if (this.websocket) {
      this.websocket.send(JSON.stringify({
        type: 'handoff',
        handoff: this.currentHandoffActivity,
        deviceId: this.currentDevice.id,
      }));
    }
    
    // Also broadcast via local network (for nearby devices)
    this.broadcastHandoffActivity();
    
    DeviceEventEmitter.emit('handoff_started', this.currentHandoffActivity);
  }

  private broadcastHandoffActivity(): void {
    if (!this.currentHandoffActivity) return;
    
    // Broadcast to nearby devices using local network
    // In production, would use Bonjour/mDNS for iOS
    DeviceEventEmitter.emit('handoff_broadcast', this.currentHandoffActivity);
  }

  private handleHandoff(handoff: any): void {
    if (handoff.deviceId === this.currentDevice.id) return;
    
    // Check if this device can continue the activity
    if (this.canContinueActivity(handoff)) {
      DeviceEventEmitter.emit('handoff_received', handoff);
      
      // Auto-continue if user preference allows
      if (this.profile.preferences.autoContinueHandoff) {
        this.continueActivity(handoff);
      }
    }
  }

  private canContinueActivity(handoff: any): boolean {
    // Check if current device/app can handle this activity type
    const supportedTypes = [
      'com.metr.browse',
      'com.metr.compose',
      'com.metr.view',
      'com.metr.edit',
    ];
    
    return supportedTypes.includes(handoff.activityType);
  }

  private continueActivity(activity: any): void {
    // Continue the activity on this device
    const activityData = {
      ...activity,
      continuedAt: Date.now(),
      continuedOnDevice: this.currentDevice.id,
    };
    
    // Store activity state
    this.currentHandoffActivity = activityData;
    
    // Emit event for app to handle
    DeviceEventEmitter.emit('continue_activity', activityData);
    
    // Update sync profile
    this.profile.lastHandoffActivity = activityData;
    this.saveProfile();
  }

  public getCurrentHandoffActivity(): HandoffData | null {
    return this.currentHandoffActivity;
  }

  // Universal Clipboard - Enhanced Implementation
  private setupUniversalClipboard(): void {
    // Monitor clipboard changes
    if (Platform.OS === 'ios') {
      // iOS Universal Clipboard
      this.setupIOSUniversalClipboard();
    } else if (Platform.OS === 'android') {
      // Android Clipboard sync
      this.setupAndroidClipboardSync();
    }
    
    // Monitor clipboard changes periodically
    this.clipboardMonitorInterval = setInterval(() => {
      this.checkClipboardChanges();
    }, 2000); // Check every 2 seconds
  }

  private setupIOSUniversalClipboard(): void {
    // Setup iOS Universal Clipboard
    // In production, would use native module to detect clipboard changes
    DeviceEventEmitter.addListener('clipboard_changed', (data) => {
      this.handleLocalClipboardChange(data);
    });
  }

  private setupAndroidClipboardSync(): void {
    // Setup Android clipboard sync
    // Android doesn't have native Universal Clipboard, so we sync via cloud
    DeviceEventEmitter.addListener('clipboard_changed', (data) => {
      this.handleLocalClipboardChange(data);
    });
  }

  private async checkClipboardChanges(): Promise<void> {
    try {
      // In production, would read from native clipboard
      // For now, we'll rely on events from native modules
    } catch (error) {
      console.error('Failed to check clipboard:', error);
    }
  }

  private async handleLocalClipboardChange(data: any): Promise<void> {
    const clipboardData = {
      content: data.content,
      contentType: data.contentType || 'text',
      timestamp: Date.now(),
      deviceId: this.currentDevice.id,
    };
    
    // Store locally
    this.lastClipboardContent = clipboardData;
    
    // Share with other devices
    await this.shareClipboard(clipboardData.content, clipboardData.contentType);
  }

  public async shareClipboard(content: string, contentType: string = 'text'): Promise<void> {
    const clipboardData = {
      content,
      contentType,
      timestamp: Date.now(),
      deviceId: this.currentDevice.id,
    };
    
    // Encrypt sensitive content
    const encrypted = this.encryptClipboardData(clipboardData);
    
    // Send via sync server
    if (this.websocket) {
      this.websocket.send(JSON.stringify({
        type: 'clipboard',
        clipboard: encrypted,
      }));
    }
    
    // Also broadcast locally (for iOS Universal Clipboard)
    if (Platform.OS === 'ios') {
      DeviceEventEmitter.emit('universal_clipboard_broadcast', clipboardData);
    }
  }

  private encryptClipboardData(data: any): any {
    // Encrypt clipboard data for privacy
    return {
      ...data,
      content: btoa(data.content), // Base64 encoding (in production use proper encryption)
      encrypted: true,
    };
  }

  private decryptClipboardData(encrypted: any): any {
    // Decrypt clipboard data
    return {
      ...encrypted,
      content: atob(encrypted.content),
      encrypted: false,
    };
  }

  private handleUniversalClipboard(clipboard: any): void {
    if (clipboard.deviceId === this.currentDevice.id) return;
    
    // Decrypt if needed
    const decrypted = clipboard.encrypted 
      ? this.decryptClipboardData(clipboard)
      : clipboard;
    
    // Update local clipboard
    // In production, would use Clipboard API
    this.lastClipboardContent = decrypted;
    
    // Emit event for app to handle
    DeviceEventEmitter.emit('universal_clipboard_received', decrypted);
    
    // Auto-paste if user preference allows
    if (this.profile.preferences.autoPasteClipboard) {
      this.pasteClipboard(decrypted.content);
    }
  }

  private pasteClipboard(content: string): void {
    // Paste clipboard content
    // In production, would use native clipboard API
    DeviceEventEmitter.emit('clipboard_paste', {content});
  }

  public getLastClipboardContent(): any {
    return this.lastClipboardContent;
  }

  private currentHandoffActivity: HandoffData | null = null;
  private lastClipboardContent: any = null;
  private clipboardMonitorInterval: any = null;

  // Continuity Camera
  private setupContinuityCamera() {
    // Setup camera sharing between devices
    DeviceEventEmitter.addListener('continuity_camera_request', () => {
      this.shareCameraFeed();
    });
  }

  private shareCameraFeed() {
    // Share camera feed with other devices
    // Implementation would use WebRTC
  }

  // Android Nearby Share
  private setupNearbyShare() {
    // Setup Android's Nearby Share
    // In production, use native module
  }

  public async shareNearby(data: any) {
    if (Platform.OS !== 'android') return;
    
    // Share data using Nearby API
    DeviceEventEmitter.emit('nearby_share', data);
  }

  // App Continuity
  private setupAppContinuity() {
    // Save and restore app state across devices
    DeviceEventEmitter.addListener('app_state_changed', (state) => {
      this.syncAppState(state);
    });
  }

  private async syncAppState(state: any) {
    const stateData: SyncData = {
      id: 'app_state',
      type: 'setting',
      data: state,
      timestamp: new Date(),
      deviceId: this.currentDevice.id,
      checksum: this.calculateChecksum(state),
      version: 1,
    };
    
    this.sendSyncData(this.encryptData(stateData));
  }

  // Public methods

  public async saveProfile() {
    try {
      await AsyncStorage.setItem('sync_profile', JSON.stringify(this.profile));
    } catch (error) {
      console.error('Failed to save sync profile:', error);
    }
  }

  public getDevices(): Device[] {
    return this.profile.devices;
  }

  public getCurrentDevice(): Device {
    return this.currentDevice;
  }

  public setSyncPreferences(preferences: UserPreferences) {
    this.profile.preferences = preferences;
    this.saveProfile();
    
    // Restart sync with new preferences
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    this.startSync();
  }

  public async forceSync() {
    await this.performSync();
  }

  public getSyncStatus(): string {
    if (this.isSyncing) return 'syncing';
    if (!this.isOnline) return 'offline';
    if (this.syncQueue.failed.length > 0) return 'error';
    return 'synced';
  }

  public clearSyncData() {
    this.syncQueue = {
      pending: [],
      inProgress: [],
      failed: [],
      completed: [],
    };
  }

  public disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}
