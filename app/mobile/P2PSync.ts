// P2PSync.ts - Peer-to-Peer Synchronization for METR
import {NativeModules, DeviceEventEmitter} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface Peer {
  id: string;
  name: string;
  address: string;
  port: number;
  lastSeen: Date;
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
}

interface SyncData {
  id: string;
  type: 'message' | 'file' | 'task' | 'note';
  data: any;
  timestamp: Date;
  hash: string;
  sender: string;
}

interface SyncProtocol {
  version: string;
  encryption: boolean;
  compression: boolean;
  maxChunkSize: number;
}

export class P2PSync {
  private static instance: P2PSync;
  private peers: Map<string, Peer>;
  private syncQueue: SyncData[];
  private isSyncing: boolean;
  private localDeviceId: string;
  private protocol: SyncProtocol;
  private conflictResolutionStrategy: 'lastWrite' | 'merge' | 'manual';

  private constructor() {
    this.peers = new Map();
    this.syncQueue = [];
    this.isSyncing = false;
    this.localDeviceId = this.generateDeviceId();
    this.conflictResolutionStrategy = 'lastWrite';
    this.protocol = {
      version: '1.0.0',
      encryption: true,
      compression: true,
      maxChunkSize: 1024 * 1024, // 1MB chunks
    };
    
    this.initialize();
  }

  public static getInstance(): P2PSync {
    if (!P2PSync.instance) {
      P2PSync.instance = new P2PSync();
    }
    return P2PSync.instance;
  }

  private async initialize() {
    // Initialize network listeners
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.discoverPeers();
      }
    });

    // Load saved peers
    await this.loadPeers();
    
    // Start discovery service
    this.startDiscoveryService();
    
    // Start sync service
    this.startSyncService();
  }

  private generateDeviceId(): string {
    return `device_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async loadPeers() {
    const savedPeers = await AsyncStorage.getItem('p2p_peers');
    if (savedPeers) {
      const peers = JSON.parse(savedPeers);
      peers.forEach((peer: Peer) => {
        this.peers.set(peer.id, peer);
      });
    }
  }

  private async savePeers() {
    const peers = Array.from(this.peers.values());
    await AsyncStorage.setItem('p2p_peers', JSON.stringify(peers));
  }

  // Discover nearby peers using mDNS/Bonjour
  public async discoverPeers(): Promise<Peer[]> {
    console.log('Discovering peers...');
    
    // In production, use react-native-zeroconf or similar
    // Simulate peer discovery
    const discoveredPeers: Peer[] = [
      {
        id: 'peer_1',
        name: 'John\'s Device',
        address: '192.168.1.100',
        port: 8080,
        lastSeen: new Date(),
        isOnline: true,
        syncStatus: 'synced',
      },
      {
        id: 'peer_2',
        name: 'Sarah\'s Device',
        address: '192.168.1.101',
        port: 8080,
        lastSeen: new Date(),
        isOnline: true,
        syncStatus: 'pending',
      },
    ];

    discoveredPeers.forEach(peer => {
      this.peers.set(peer.id, peer);
    });

    await this.savePeers();
    return discoveredPeers;
  }

  // Connect to a peer
  public async connectToPeer(peerId: string): Promise<boolean> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      console.error(`Peer ${peerId} not found`);
      return false;
    }

    try {
      // Establish WebRTC/WebSocket connection
      // In production, use react-native-webrtc
      console.log(`Connecting to ${peer.name} at ${peer.address}:${peer.port}`);
      
      // Simulate connection
      peer.isOnline = true;
      peer.lastSeen = new Date();
      
      // Perform handshake
      await this.performHandshake(peer);
      
      // Start syncing
      await this.syncWithPeer(peer);
      
      return true;
    } catch (error) {
      console.error(`Failed to connect to peer ${peerId}:`, error);
      peer.isOnline = false;
      return false;
    }
  }

  // Perform handshake with peer
  private async performHandshake(peer: Peer): Promise<void> {
    // Exchange protocol version and capabilities
    const handshake = {
      deviceId: this.localDeviceId,
      protocol: this.protocol,
      timestamp: new Date(),
    };
    
    console.log(`Handshake with ${peer.name} completed`);
  }

  // Sync data with a peer
  public async syncWithPeer(peer: Peer): Promise<void> {
    if (this.isSyncing) {
      console.log('Already syncing, queueing request');
      return;
    }

    this.isSyncing = true;
    peer.syncStatus = 'syncing';

    try {
      // Get local changes
      const localChanges = await this.getLocalChanges(peer.lastSeen);
      
      // Get remote changes
      const remoteChanges = await this.getRemoteChanges(peer);
      
      // Detect and resolve conflicts
      const conflicts = this.detectConflicts(localChanges, remoteChanges);
      const resolved = await this.resolveConflicts(conflicts);
      
      // Apply remote changes
      await this.applyChanges(remoteChanges);
      
      // Send local changes
      await this.sendChanges(peer, localChanges);
      
      peer.syncStatus = 'synced';
      peer.lastSeen = new Date();
      
      console.log(`Sync with ${peer.name} completed`);
    } catch (error) {
      console.error(`Sync with ${peer.name} failed:`, error);
      peer.syncStatus = 'error';
    } finally {
      this.isSyncing = false;
    }
  }

  // Get local changes since last sync
  private async getLocalChanges(since: Date): Promise<SyncData[]> {
    const changes: SyncData[] = [];
    
    // Get messages
    const messages = await AsyncStorage.getItem('messages');
    if (messages) {
      const parsedMessages = JSON.parse(messages);
      parsedMessages.forEach((msg: any) => {
        if (new Date(msg.timestamp) > since) {
          changes.push({
            id: msg.id,
            type: 'message',
            data: msg,
            timestamp: new Date(msg.timestamp),
            hash: this.calculateHash(msg),
            sender: this.localDeviceId,
          });
        }
      });
    }
    
    return changes;
  }

  // Get remote changes from peer
  private async getRemoteChanges(peer: Peer): Promise<SyncData[]> {
    // In production, fetch from peer via P2P connection
    // Simulate remote changes
    return [
      {
        id: 'remote_1',
        type: 'message',
        data: {text: 'Hello from peer'},
        timestamp: new Date(),
        hash: 'abc123',
        sender: peer.id,
      },
    ];
  }

  // Detect conflicts between local and remote changes
  private detectConflicts(local: SyncData[], remote: SyncData[]): SyncData[][] {
    const conflicts: SyncData[][] = [];
    
    local.forEach(localItem => {
      const remoteItem = remote.find(r => r.id === localItem.id);
      if (remoteItem && remoteItem.hash !== localItem.hash) {
        conflicts.push([localItem, remoteItem]);
      }
    });
    
    return conflicts;
  }

  // Resolve conflicts based on strategy
  private async resolveConflicts(conflicts: SyncData[][]): Promise<SyncData[]> {
    const resolved: SyncData[] = [];
    
    for (const [local, remote] of conflicts) {
      switch (this.conflictResolutionStrategy) {
        case 'lastWrite':
          // Choose the most recent change
          resolved.push(local.timestamp > remote.timestamp ? local : remote);
          break;
        
        case 'merge':
          // Merge changes if possible
          const merged = await this.mergeChanges(local, remote);
          resolved.push(merged);
          break;
        
        case 'manual':
          // Ask user to resolve
          const userChoice = await this.promptUserResolution(local, remote);
          resolved.push(userChoice);
          break;
      }
    }
    
    return resolved;
  }

  // Merge two conflicting changes
  private async mergeChanges(local: SyncData, remote: SyncData): Promise<SyncData> {
    // Implement CRDT or operational transformation
    // For now, simple merge
    return {
      ...local,
      data: {...local.data, ...remote.data},
      timestamp: new Date(),
      hash: this.calculateHash({...local.data, ...remote.data}),
    };
  }

  // Prompt user to resolve conflict
  private async promptUserResolution(local: SyncData, remote: SyncData): Promise<SyncData> {
    // In production, show UI dialog
    // For now, choose local
    return local;
  }

  // Apply changes from remote peer
  private async applyChanges(changes: SyncData[]): Promise<void> {
    for (const change of changes) {
      switch (change.type) {
        case 'message':
          await this.applyMessageChange(change);
          break;
        case 'file':
          await this.applyFileChange(change);
          break;
        case 'task':
          await this.applyTaskChange(change);
          break;
        case 'note':
          await this.applyNoteChange(change);
          break;
      }
    }
  }

  private async applyMessageChange(change: SyncData) {
    const messages = await AsyncStorage.getItem('messages');
    const parsed = messages ? JSON.parse(messages) : [];
    parsed.push(change.data);
    await AsyncStorage.setItem('messages', JSON.stringify(parsed));
  }

  private async applyFileChange(change: SyncData) {
    // Handle file sync
    console.log('Syncing file:', change.id);
  }

  private async applyTaskChange(change: SyncData) {
    // Handle task sync
    console.log('Syncing task:', change.id);
  }

  private async applyNoteChange(change: SyncData) {
    // Handle note sync
    console.log('Syncing note:', change.id);
  }

  // Send changes to peer
  private async sendChanges(peer: Peer, changes: SyncData[]): Promise<void> {
    for (const change of changes) {
      await this.sendDataToPeer(peer, change);
    }
  }

  // Send data to peer with chunking for large data
  private async sendDataToPeer(peer: Peer, data: SyncData): Promise<void> {
    const serialized = JSON.stringify(data);
    const chunks = this.chunkData(serialized, this.protocol.maxChunkSize);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = {
        id: data.id,
        chunkIndex: i,
        totalChunks: chunks.length,
        data: chunks[i],
      };
      
      // Send chunk to peer
      console.log(`Sending chunk ${i + 1}/${chunks.length} to ${peer.name}`);
    }
  }

  // Chunk data for transmission
  private chunkData(data: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Calculate hash for data integrity
  private calculateHash(data: any): string {
    // Simple hash implementation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // Start discovery service
  private startDiscoveryService() {
    setInterval(() => {
      this.broadcastPresence();
    }, 10000); // Broadcast every 10 seconds
  }

  // Broadcast presence to network
  private broadcastPresence() {
    const announcement = {
      deviceId: this.localDeviceId,
      name: 'My Device',
      port: 8080,
      protocol: this.protocol,
    };
    
    // Broadcast via UDP/mDNS
    console.log('Broadcasting presence...');
  }

  // Start automatic sync service
  private startSyncService() {
    setInterval(async () => {
      const onlinePeers = Array.from(this.peers.values()).filter(p => p.isOnline);
      for (const peer of onlinePeers) {
        if (peer.syncStatus === 'pending') {
          await this.syncWithPeer(peer);
        }
      }
    }, 30000); // Sync every 30 seconds
  }

  // Get all connected peers
  public getConnectedPeers(): Peer[] {
    return Array.from(this.peers.values()).filter(p => p.isOnline);
  }

  // Get sync status
  public getSyncStatus(): {
    isSyncing: boolean;
    queueLength: number;
    connectedPeers: number;
  } {
    return {
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      connectedPeers: this.getConnectedPeers().length,
    };
  }

  // Set conflict resolution strategy
  public setConflictResolution(strategy: 'lastWrite' | 'merge' | 'manual') {
    this.conflictResolutionStrategy = strategy;
  }

  // Manual sync trigger
  public async syncAll(): Promise<void> {
    const peers = this.getConnectedPeers();
    for (const peer of peers) {
      await this.syncWithPeer(peer);
    }
  }
}
