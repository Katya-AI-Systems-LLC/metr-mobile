// DeFiIntegration.tsx - DeFi & Crypto Trading for METR
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import Web3 from 'web3';

interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  icon: string;
  address?: string;
}

interface DeFiProtocol {
  name: string;
  type: 'lending' | 'dex' | 'yield' | 'derivative' | 'insurance';
  tvl: number;
  apy: number;
  risk: 'low' | 'medium' | 'high';
  userPosition?: number;
}

interface TradingStrategy {
  name: string;
  type: 'arbitrage' | 'market-making' | 'trend' | 'grid' | 'dca';
  isActive: boolean;
  profit: number;
  trades: number;
  winRate: number;
}

export const DeFiIntegration: React.FC = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([
    {symbol: 'ETH', name: 'Ethereum', balance: 5.42, price: 2345, change24h: 3.5, icon: 'ethereum'},
    {symbol: 'BTC', name: 'Bitcoin', balance: 0.15, price: 43250, change24h: -1.2, icon: 'bitcoin'},
    {symbol: 'USDC', name: 'USD Coin', balance: 10000, price: 1.00, change24h: 0, icon: 'currency-usd'},
    {symbol: 'METR', name: 'METR Token', balance: 50000, price: 0.85, change24h: 15.3, icon: 'star'},
  ]);
  
  const [protocols, setProtocols] = useState<DeFiProtocol[]>([
    {name: 'Aave', type: 'lending', tvl: 12500000000, apy: 5.2, risk: 'low', userPosition: 5000},
    {name: 'Uniswap', type: 'dex', tvl: 7500000000, apy: 12.5, risk: 'medium'},
    {name: 'Curve', type: 'yield', tvl: 18000000000, apy: 8.7, risk: 'low'},
    {name: 'GMX', type: 'derivative', tvl: 450000000, apy: 25.3, risk: 'high'},
  ]);
  
  const [strategies, setStrategies] = useState<TradingStrategy[]>([
    {name: 'ETH-USDC Arbitrage', type: 'arbitrage', isActive: true, profit: 523.45, trades: 127, winRate: 0.89},
    {name: 'BTC Grid Trading', type: 'grid', isActive: false, profit: 1250.00, trades: 456, winRate: 0.72},
    {name: 'DCA Strategy', type: 'dca', isActive: true, profit: 890.30, trades: 30, winRate: 0.83},
  ]);
  
  const [totalPortfolio, setTotalPortfolio] = useState(0);
  const [totalYield, setTotalYield] = useState(0);

  useEffect(() => {
    calculatePortfolio();
    startPriceUpdates();
  }, []);

  const calculatePortfolio = () => {
    const total = assets.reduce((sum, asset) => sum + (asset.balance * asset.price), 0);
    setTotalPortfolio(total);
    
    const yieldTotal = protocols
      .filter(p => p.userPosition)
      .reduce((sum, p) => sum + (p.userPosition! * p.apy / 100), 0);
    setTotalYield(yieldTotal);
  };

  const startPriceUpdates = () => {
    setInterval(() => {
      setAssets(prev => prev.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() - 0.5) * 0.01),
        change24h: asset.change24h + (Math.random() - 0.5) * 0.5,
      })));
      calculatePortfolio();
    }, 5000);
  };

  const swapTokens = (from: string, to: string, amount: number) => {
    console.log(`Swapping ${amount} ${from} to ${to}`);
    // Implement swap logic
  };

  const stakeLiquidity = (protocol: string, amount: number) => {
    console.log(`Staking ${amount} in ${protocol}`);
    // Implement staking logic
  };

  const executeTrade = (strategy: TradingStrategy) => {
    console.log(`Executing ${strategy.name}`);
    // Implement trading logic
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Portfolio Overview */}
      <GlassCard style={styles.portfolioCard}>
        <Text style={styles.sectionTitle}>Total Portfolio Value</Text>
        <Text style={styles.portfolioValue}>{formatNumber(totalPortfolio)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>24h Change</Text>
            <Text style={[styles.statValue, {color: MetrTheme.colors.semantic.success}]}>
              +{formatNumber(totalPortfolio * 0.035)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Total Yield</Text>
            <Text style={styles.statValue}>{formatNumber(totalYield)}/year</Text>
          </View>
        </View>
      </GlassCard>

      {/* Crypto Assets */}
      <Text style={styles.sectionTitle}>Crypto Assets</Text>
      {assets.map(asset => (
        <GlassCard key={asset.symbol} style={styles.assetCard}>
          <View style={styles.assetRow}>
            <Icon name={asset.icon} size={32} color={MetrTheme.colors.primary.electric} />
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetSymbol}>{asset.symbol}</Text>
            </View>
            <View style={styles.assetValues}>
              <Text style={styles.assetBalance}>{asset.balance.toFixed(4)}</Text>
              <Text style={styles.assetPrice}>{formatNumber(asset.price)}</Text>
              <Text style={[
                styles.assetChange,
                {color: asset.change24h >= 0 ? MetrTheme.colors.semantic.success : MetrTheme.colors.semantic.error}
              ]}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </Text>
            </View>
          </View>
          <View style={styles.assetActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Swap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Stake</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      ))}

      {/* DeFi Protocols */}
      <Text style={styles.sectionTitle}>DeFi Opportunities</Text>
      {protocols.map(protocol => (
        <GlassCard key={protocol.name} style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <Text style={styles.protocolName}>{protocol.name}</Text>
            <View style={[styles.riskBadge, styles[`risk${protocol.risk}`]]}>
              <Text style={styles.riskText}>{protocol.risk.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.protocolStats}>
            <View style={styles.protocolStat}>
              <Text style={styles.protocolStatLabel}>TVL</Text>
              <Text style={styles.protocolStatValue}>{formatNumber(protocol.tvl)}</Text>
            </View>
            <View style={styles.protocolStat}>
              <Text style={styles.protocolStatLabel}>APY</Text>
              <Text style={styles.protocolStatValue}>{protocol.apy}%</Text>
            </View>
            {protocol.userPosition && (
              <View style={styles.protocolStat}>
                <Text style={styles.protocolStatLabel}>Your Position</Text>
                <Text style={styles.protocolStatValue}>{formatNumber(protocol.userPosition)}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.depositButton}
            onPress={() => stakeLiquidity(protocol.name, 1000)}
          >
            <Text style={styles.depositButtonText}>
              {protocol.userPosition ? 'Add Liquidity' : 'Deposit'}
            </Text>
          </TouchableOpacity>
        </GlassCard>
      ))}

      {/* Trading Bots */}
      <Text style={styles.sectionTitle}>AI Trading Strategies</Text>
      {strategies.map(strategy => (
        <GlassCard key={strategy.name} style={styles.strategyCard}>
          <View style={styles.strategyHeader}>
            <Text style={styles.strategyName}>{strategy.name}</Text>
            <TouchableOpacity
              style={[styles.toggleButton, strategy.isActive && styles.toggleActive]}
              onPress={() => executeTrade(strategy)}
            >
              <Text style={styles.toggleText}>
                {strategy.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.strategyStats}>
            <View style={styles.strategyStat}>
              <Text style={styles.strategyStatLabel}>Profit</Text>
              <Text style={[styles.strategyStatValue, {color: MetrTheme.colors.semantic.success}]}>
                +{formatNumber(strategy.profit)}
              </Text>
            </View>
            <View style={styles.strategyStat}>
              <Text style={styles.strategyStatLabel}>Trades</Text>
              <Text style={styles.strategyStatValue}>{strategy.trades}</Text>
            </View>
            <View style={styles.strategyStat}>
              <Text style={styles.strategyStatLabel}>Win Rate</Text>
              <Text style={styles.strategyStatValue}>{(strategy.winRate * 100).toFixed(1)}%</Text>
            </View>
          </View>
        </GlassCard>
      ))}

      {/* Flash Loan Arbitrage */}
      <GlassCard style={styles.flashLoanCard}>
        <Text style={styles.flashLoanTitle}>⚡ Flash Loan Arbitrage</Text>
        <Text style={styles.flashLoanDescription}>
          Automated cross-DEX arbitrage using flash loans
        </Text>
        <View style={styles.flashLoanStats}>
          <Text style={styles.flashLoanProfit}>Today's Profit: +$2,345.67</Text>
          <Text style={styles.flashLoanOpportunities}>3 opportunities detected</Text>
        </View>
        <TouchableOpacity style={styles.executeButton}>
          <Text style={styles.executeButtonText}>Execute Arbitrage</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
    padding: 20,
  },
  portfolioCard: {
    padding: 24,
    marginBottom: 20,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginVertical: 16,
  },
  assetCard: {
    padding: 16,
    marginBottom: 12,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  assetSymbol: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  assetPrice: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  assetChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  assetActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: MetrTheme.colors.primary.electric,
  },
  protocolCard: {
    padding: 16,
    marginBottom: 12,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  protocolName: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  risklow: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  riskmedium: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  riskhigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  protocolStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  protocolStat: {
    flex: 1,
  },
  protocolStatLabel: {
    fontSize: 10,
    color: MetrTheme.colors.dark.textSecondary,
  },
  protocolStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 2,
  },
  depositButton: {
    backgroundColor: MetrTheme.colors.primary.teal,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  strategyCard: {
    padding: 16,
    marginBottom: 12,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleActive: {
    backgroundColor: MetrTheme.colors.semantic.success,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  strategyStats: {
    flexDirection: 'row',
  },
  strategyStat: {
    flex: 1,
  },
  strategyStatLabel: {
    fontSize: 10,
    color: MetrTheme.colors.dark.textSecondary,
  },
  strategyStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 2,
  },
  flashLoanCard: {
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  flashLoanTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.primary.pink,
    marginBottom: 8,
  },
  flashLoanDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 16,
  },
  flashLoanStats: {
    marginBottom: 16,
  },
  flashLoanProfit: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.semantic.success,
  },
  flashLoanOpportunities: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  executeButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
