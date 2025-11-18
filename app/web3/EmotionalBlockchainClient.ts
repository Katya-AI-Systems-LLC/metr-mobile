// EmotionalBlockchainClient.ts - JS client for EmotionalBlockchain in METR
import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter} from 'react-native';
import Web3Manager from './Web3Manager';

export interface EmotionalStateInput {
  emotion: string;
  intensity: number; // -100..100
  context: string;
  isPublic: boolean;
  teamId?: string;
}

export interface RecordedEmotionalState extends EmotionalStateInput {
  hash: string;
  timestamp: number;
  userAddress: string | null;
}

export class EmotionalBlockchainClient {
  private static instance: EmotionalBlockchainClient;
  private contract: ethers.Contract | null = null;
  private contractAddress: string | null = null;

  private constructor() {}

  public static getInstance(): EmotionalBlockchainClient {
    if (!EmotionalBlockchainClient.instance) {
      EmotionalBlockchainClient.instance = new EmotionalBlockchainClient();
    }
    return EmotionalBlockchainClient.instance;
  }

  public async initialize(contractAddress: string): Promise<void> {
    this.contractAddress = contractAddress;

    const web3 = Web3Manager.getInstance();
    // Ensure Web3Manager is initialized
    // In production, you might pass specific config
    try {
      await web3.initialize();
    } catch (e) {
      // Ignore if already initialized or fails in dev
    }

    const provider = web3.getProvider();
    const signer = web3.getSigner();

    if (!provider && !signer) {
      return;
    }

    const runner = signer || provider!;
    this.contract = new ethers.Contract(contractAddress, [], runner);
  }

  public getContractAddress(): string | null {
    return this.contractAddress;
  }

  // Record emotional state (off-chain + optional on-chain placeholder)
  public async recordEmotionalState(input: EmotionalStateInput): Promise<RecordedEmotionalState> {
    const web3 = Web3Manager.getInstance();
    const userAddress = web3.getWalletAddress();
    const timestamp = Date.now();

    const payload = {
      userAddress,
      timestamp,
      emotion: input.emotion,
      intensity: input.intensity,
      context: input.context,
      isPublic: input.isPublic,
      teamId: input.teamId,
    };

    const hash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(payload)));

    // Placeholder for real on-chain call to EmotionalBlockchain contract
    if (this.contract && this.contractAddress) {
      // In a production setup, ABI and real calls would be wired like:
      // const tx = await this.contract.recordEmotionalState(emotionEnum, intensity, context, isPublic);
      // await tx.wait();
      // For now, we only emit an event and persist locally.
    }

    const recorded: RecordedEmotionalState = {
      ...input,
      hash,
      timestamp,
      userAddress,
    };

    try {
      await this.appendToIndex(hash);
      await AsyncStorage.setItem(`emotional_state_${hash}`, JSON.stringify(recorded));
    } catch (e) {
      // Ignore storage errors in dev
    }

    DeviceEventEmitter.emit('emotional_state_recorded', recorded);
    return recorded;
  }

  public async getRecentStates(limit: number = 20): Promise<RecordedEmotionalState[]> {
    // Simple implementation: rely on an index stored in AsyncStorage
    try {
      const indexRaw = await AsyncStorage.getItem('emotional_states_index');
      if (!indexRaw) return [];

      const hashes: string[] = JSON.parse(indexRaw);
      const recentHashes = hashes.slice(-limit).reverse();

      const states: RecordedEmotionalState[] = [];
      for (const h of recentHashes) {
        const raw = await AsyncStorage.getItem(`emotional_state_${h}`);
        if (raw) {
          states.push(JSON.parse(raw));
        }
      }
      return states;
    } catch (e) {
      return [];
    }
  }

  // Helper to maintain a simple index of hashes (called by higher-level orchestrators if needed)
  public async appendToIndex(hash: string): Promise<void> {
    try {
      const indexRaw = await AsyncStorage.getItem('emotional_states_index');
      const hashes: string[] = indexRaw ? JSON.parse(indexRaw) : [];
      hashes.push(hash);
      await AsyncStorage.setItem('emotional_states_index', JSON.stringify(hashes.slice(-1000)));
    } catch (e) {
      // ignore
    }
  }
}

export default EmotionalBlockchainClient;
