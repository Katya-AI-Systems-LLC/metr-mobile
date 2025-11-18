// Web3Manager.ts - Web3 integration for METR
import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletConnect from '@walletconnect/client';
import {EventEmitter} from 'events';

export interface Web3Config {
  networkType: 'mainnet' | 'testnet' | 'polygon' | 'arbitrum' | 'custom';
  rpcUrl?: string;
  chainId: number;
  enableWalletConnect: boolean;
  enableMetaMask: boolean;
}

export interface NFTAchievement {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  earnedDate: Date;
  tokenId?: string;
  contractAddress?: string;
}

export interface TeamToken {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  contractAddress: string;
}

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  forVotes: number;
  againstVotes: number;
  status: 'pending' | 'active' | 'passed' | 'rejected' | 'executed';
  deadline: Date;
}

class Web3Manager extends EventEmitter {
  private static instance: Web3Manager;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private walletConnect: WalletConnect | null = null;
  private config: Web3Config;
  private walletAddress: string | null = null;
  private isConnected: boolean = false;

  // Smart contract instances
  private achievementContract: ethers.Contract | null = null;
  private tokenContract: ethers.Contract | null = null;
  private daoContract: ethers.Contract | null = null;

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): Web3Manager {
    if (!Web3Manager.instance) {
      Web3Manager.instance = new Web3Manager();
    }
    return Web3Manager.instance;
  }

  private getDefaultConfig(): Web3Config {
    return {
      networkType: 'polygon',
      chainId: 137, // Polygon mainnet
      enableWalletConnect: true,
      enableMetaMask: true,
    };
  }

  public async initialize(config?: Partial<Web3Config>): Promise<void> {
    try {
      this.config = {...this.config, ...config};
      
      // Initialize provider based on network type
      this.initializeProvider();
      
      // Check for saved wallet connection
      const savedWallet = await AsyncStorage.getItem('wallet_connection');
      if (savedWallet) {
        const walletData = JSON.parse(savedWallet);
        await this.reconnectWallet(walletData);
      }
      
      this.emit('initialized');
      console.log('Web3Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Web3Manager:', error);
      throw error;
    }
  }

  private initializeProvider(): void {
    let rpcUrl: string;
    
    switch (this.config.networkType) {
      case 'mainnet':
        rpcUrl = 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY';
        break;
      case 'polygon':
        rpcUrl = 'https://polygon-rpc.com';
        break;
      case 'arbitrum':
        rpcUrl = 'https://arb1.arbitrum.io/rpc';
        break;
      case 'testnet':
        rpcUrl = 'https://goerli.infura.io/v3/YOUR_KEY';
        break;
      case 'custom':
        rpcUrl = this.config.rpcUrl || 'http://localhost:8545';
        break;
      default:
        rpcUrl = 'https://polygon-rpc.com';
    }
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  // Wallet Connection Methods
  public async connectWallet(method: 'walletconnect' | 'metamask' | 'privatekey'): Promise<string> {
    try {
      let address: string;
      
      switch (method) {
        case 'walletconnect':
          address = await this.connectWalletConnect();
          break;
        case 'metamask':
          address = await this.connectMetaMask();
          break;
        case 'privatekey':
          // Handle private key connection (for testing)
          throw new Error('Private key connection not implemented');
        default:
          throw new Error('Invalid connection method');
      }
      
      this.walletAddress = address;
      this.isConnected = true;
      
      // Save connection info
      await AsyncStorage.setItem('wallet_connection', JSON.stringify({
        method,
        address,
        chainId: this.config.chainId,
      }));
      
      this.emit('walletConnected', address);
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  private async connectWalletConnect(): Promise<string> {
    // Initialize WalletConnect
    this.walletConnect = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: {
        open: (uri: string) => {
          this.emit('walletConnectQR', uri);
        },
        close: () => {
          this.emit('walletConnectClosed');
        },
      },
    });
    
    // Create session
    if (!this.walletConnect.connected) {
      await this.walletConnect.createSession();
    }
    
    return new Promise((resolve, reject) => {
      this.walletConnect!.on('session_update', (error, payload) => {
        if (error) {
          reject(error);
        } else {
          const {accounts} = payload.params[0];
          resolve(accounts[0]);
        }
      });
      
      this.walletConnect!.on('connect', (error, payload) => {
        if (error) {
          reject(error);
        } else {
          const {accounts} = payload.params[0];
          resolve(accounts[0]);
        }
      });
    });
  }

  private async connectMetaMask(): Promise<string> {
    // MetaMask connection for React Native
    // This would typically use @metamask/sdk-react-native
    throw new Error('MetaMask connection not yet implemented');
  }

  private async reconnectWallet(walletData: any): Promise<void> {
    // Reconnect to previously connected wallet
    this.walletAddress = walletData.address;
    this.isConnected = true;
  }

  public async disconnectWallet(): Promise<void> {
    if (this.walletConnect?.connected) {
      await this.walletConnect.killSession();
    }
    
    this.walletAddress = null;
    this.isConnected = false;
    this.signer = null;
    
    await AsyncStorage.removeItem('wallet_connection');
    this.emit('walletDisconnected');
  }

  // NFT Achievement Methods
  public async mintAchievement(
    userId: string,
    achievementType: string,
    metadata: any
  ): Promise<NFTAchievement> {
    if (!this.achievementContract) {
      throw new Error('Achievement contract not initialized');
    }
    
    try {
      const tx = await this.achievementContract.mintAchievement(
        userId,
        achievementType,
        JSON.stringify(metadata)
      );
      
      await tx.wait();
      
      const achievement: NFTAchievement = {
        id: `achievement_${Date.now()}`,
        name: achievementType,
        description: metadata.description,
        imageUrl: metadata.imageUrl,
        rarity: metadata.rarity || 'common',
        earnedDate: new Date(),
        tokenId: tx.hash,
        contractAddress: await this.achievementContract.getAddress(),
      };
      
      this.emit('achievementMinted', achievement);
      return achievement;
    } catch (error) {
      console.error('Failed to mint achievement:', error);
      throw error;
    }
  }

  public async getUserAchievements(address: string): Promise<NFTAchievement[]> {
    // Query blockchain for user's achievements
    if (!this.achievementContract) {
      return [];
    }
    
    try {
      const achievements = await this.achievementContract.getUserAchievements(address);
      return achievements.map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        imageUrl: a.imageUrl,
        rarity: a.rarity,
        earnedDate: new Date(a.timestamp * 1000),
        tokenId: a.tokenId,
        contractAddress: a.contractAddress,
      }));
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }

  // Token Economy Methods
  public async getTokenBalance(address?: string): Promise<TeamToken> {
    const walletAddress = address || this.walletAddress;
    if (!walletAddress || !this.tokenContract) {
      throw new Error('Wallet not connected or token contract not initialized');
    }
    
    try {
      const balance = await this.tokenContract.balanceOf(walletAddress);
      const decimals = await this.tokenContract.decimals();
      const symbol = await this.tokenContract.symbol();
      const name = await this.tokenContract.name();
      
      return {
        symbol,
        name,
        balance: Number(ethers.formatUnits(balance, decimals)),
        decimals,
        contractAddress: await this.tokenContract.getAddress(),
      };
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }

  public async transferTokens(
    to: string,
    amount: number,
    reason?: string
  ): Promise<string> {
    if (!this.tokenContract || !this.signer) {
      throw new Error('Token contract or signer not initialized');
    }
    
    try {
      const decimals = await this.tokenContract.decimals();
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.tokenContract.connect(this.signer).transfer(to, amountWei);
      await tx.wait();
      
      this.emit('tokensTransferred', {to, amount, txHash: tx.hash, reason});
      return tx.hash;
    } catch (error) {
      console.error('Failed to transfer tokens:', error);
      throw error;
    }
  }

  // DAO Methods
  public async createProposal(
    title: string,
    description: string,
    actions: any[]
  ): Promise<string> {
    if (!this.daoContract || !this.signer) {
      throw new Error('DAO contract or signer not initialized');
    }
    
    try {
      const tx = await this.daoContract.connect(this.signer).propose(
        title,
        description,
        actions
      );
      
      await tx.wait();
      
      this.emit('proposalCreated', {title, txHash: tx.hash});
      return tx.hash;
    } catch (error) {
      console.error('Failed to create proposal:', error);
      throw error;
    }
  }

  public async voteOnProposal(
    proposalId: string,
    support: boolean,
    reason?: string
  ): Promise<string> {
    if (!this.daoContract || !this.signer) {
      throw new Error('DAO contract or signer not initialized');
    }
    
    try {
      const tx = await this.daoContract.connect(this.signer).castVote(
        proposalId,
        support ? 1 : 0,
        reason || ''
      );
      
      await tx.wait();
      
      this.emit('voteCast', {proposalId, support, txHash: tx.hash});
      return tx.hash;
    } catch (error) {
      console.error('Failed to vote on proposal:', error);
      throw error;
    }
  }

  public async getActiveProposals(): Promise<DAOProposal[]> {
    if (!this.daoContract) {
      return [];
    }
    
    try {
      const proposals = await this.daoContract.getActiveProposals();
      return proposals.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        proposer: p.proposer,
        forVotes: Number(p.forVotes),
        againstVotes: Number(p.againstVotes),
        status: p.status,
        deadline: new Date(p.deadline * 1000),
      }));
    } catch (error) {
      console.error('Failed to get proposals:', error);
      return [];
    }
  }

  // Blockchain Audit Trail
  public async logAction(
    action: string,
    data: any,
    ipfsHash?: string
  ): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    try {
      // In a real implementation, this would write to a smart contract
      const timestamp = Date.now();
      const hash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify({action, data, timestamp, ipfsHash}))
      );
      
      // Store in local database for now
      await AsyncStorage.setItem(`audit_${hash}`, JSON.stringify({
        action,
        data,
        timestamp,
        ipfsHash,
        hash,
      }));
      
      this.emit('actionLogged', {action, hash});
      return hash;
    } catch (error) {
      console.error('Failed to log action:', error);
      throw error;
    }
  }

  // Utility Methods
  public async getGasPrice(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const gasPrice = await this.provider.getFeeData();
    return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
  }

  public async getNetworkInfo(): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: Number(network.chainId),
    };
  }

  // Expose low-level provider/signer for advanced modules (e.g., EmotionalBlockchainClient)
  public getProvider(): ethers.Provider | null {
    return this.provider;
  }

  public getSigner(): ethers.Signer | null {
    return this.signer;
  }

  public isWalletConnected(): boolean {
    return this.isConnected;
  }

  public getWalletAddress(): string | null {
    return this.walletAddress;
  }

  // Smart Contract Initialization
  public async initializeContracts(contracts: {
    achievement?: string;
    token?: string;
    dao?: string;
  }): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    // Initialize smart contracts with their ABIs and addresses
    // This is a placeholder - actual implementation would load real ABIs
    
    if (contracts.achievement) {
      this.achievementContract = new ethers.Contract(
        contracts.achievement,
        [], // ABI would go here
        this.signer || this.provider
      );
    }
    
    if (contracts.token) {
      this.tokenContract = new ethers.Contract(
        contracts.token,
        [], // ABI would go here
        this.signer || this.provider
      );
    }
    
    if (contracts.dao) {
      this.daoContract = new ethers.Contract(
        contracts.dao,
        [], // ABI would go here
        this.signer || this.provider
      );
    }
  }
}

export default Web3Manager;
