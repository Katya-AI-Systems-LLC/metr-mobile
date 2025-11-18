// MetaversePortal.tsx - Metaverse & Digital Twin Integration for METR
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import LinearGradient from 'react-native-linear-gradient';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface VirtualWorld {
  id: string;
  name: string;
  type: 'office' | 'social' | 'gaming' | 'educational' | 'creative';
  participants: number;
  maxCapacity: number;
  theme: string;
  features: string[];
  isActive: boolean;
}

interface Avatar {
  id: string;
  name: string;
  appearance: {
    model: string;
    skin: string;
    outfit: string;
    accessories: string[];
  };
  stats: {
    level: number;
    experience: number;
    reputation: number;
    achievements: string[];
  };
  position: {x: number; y: number; z: number};
  animation: string;
}

interface DigitalAsset {
  id: string;
  name: string;
  type: 'wearable' | 'furniture' | 'vehicle' | 'pet' | 'land';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owner: string;
  value: number;
  isNFT: boolean;
}

export const MetaversePortal: React.FC = () => {
  const [worlds, setWorlds] = useState<VirtualWorld[]>([
    {
      id: '1',
      name: 'METR Headquarters',
      type: 'office',
      participants: 127,
      maxCapacity: 500,
      theme: 'Cyberpunk',
      features: ['Voice Chat', '3D Whiteboard', 'Screen Share', 'AI Assistant'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Creative Hub',
      type: 'creative',
      participants: 89,
      maxCapacity: 200,
      theme: 'Abstract',
      features: ['3D Modeling', 'Music Studio', 'Art Gallery', 'NFT Showcase'],
      isActive: true,
    },
    {
      id: '3',
      name: 'Social Plaza',
      type: 'social',
      participants: 342,
      maxCapacity: 1000,
      theme: 'Futuristic',
      features: ['Events', 'Games', 'Marketplace', 'Dating'],
      isActive: true,
    },
  ]);

  const [myAvatar, setMyAvatar] = useState<Avatar>({
    id: 'avatar_1',
    name: 'CyberNinja',
    appearance: {
      model: 'humanoid',
      skin: 'neon_purple',
      outfit: 'tech_suit',
      accessories: ['vr_goggles', 'jetpack', 'hologram_pet'],
    },
    stats: {
      level: 42,
      experience: 8750,
      reputation: 95,
      achievements: ['Early Adopter', 'Social Butterfly', 'Code Master'],
    },
    position: {x: 0, y: 0, z: 0},
    animation: 'idle',
  });

  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>([
    {
      id: 'asset_1',
      name: 'Quantum Suit',
      type: 'wearable',
      rarity: 'legendary',
      owner: 'user_1',
      value: 2500,
      isNFT: true,
    },
    {
      id: 'asset_2',
      name: 'Flying Car',
      type: 'vehicle',
      rarity: 'epic',
      owner: 'user_1',
      value: 5000,
      isNFT: true,
    },
    {
      id: 'asset_3',
      name: 'AI Companion',
      type: 'pet',
      rarity: 'rare',
      owner: 'user_1',
      value: 1000,
      isNFT: false,
    },
  ]);

  const [currentWorld, setCurrentWorld] = useState<VirtualWorld | null>(null);
  const [isInVR, setIsInVR] = useState(false);

  const enterWorld = (world: VirtualWorld) => {
    setCurrentWorld(world);
    setIsInVR(true);
    console.log(`Entering ${world.name}`);
  };

  const exitWorld = () => {
    setCurrentWorld(null);
    setIsInVR(false);
  };

  const customizeAvatar = () => {
    console.log('Opening avatar customization');
    // Open avatar editor
  };

  const mintAssetAsNFT = (asset: DigitalAsset) => {
    console.log(`Minting ${asset.name} as NFT`);
    asset.isNFT = true;
    asset.value *= 2;
    setDigitalAssets([...digitalAssets]);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const renderWorldExplorer = () => (
    <View style={styles.worldExplorer}>
      <Text style={styles.sectionTitle}>🌐 Virtual Worlds</Text>
      
      {worlds.map(world => (
        <GlassCard key={world.id} style={styles.worldCard}>
          <View style={styles.worldHeader}>
            <View>
              <Text style={styles.worldName}>{world.name}</Text>
              <Text style={styles.worldTheme}>{world.theme} Theme</Text>
            </View>
            <View style={styles.worldStats}>
              <Icon name="account-group" size={16} color={MetrTheme.colors.primary.teal} />
              <Text style={styles.worldParticipants}>
                {world.participants}/{world.maxCapacity}
              </Text>
            </View>
          </View>
          
          <View style={styles.worldFeatures}>
            {world.features.map((feature, index) => (
              <View key={index} style={styles.featureBadge}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.enterButton}
            onPress={() => enterWorld(world)}
          >
            <Text style={styles.enterButtonText}>Enter World</Text>
            <Icon name="virtual-reality" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </GlassCard>
      ))}
    </View>
  );

  const renderAvatarProfile = () => (
    <GlassCard style={styles.avatarCard}>
      <Text style={styles.sectionTitle}>👤 My Avatar</Text>
      
      <View style={styles.avatarPreview}>
        {/* 3D Avatar Preview would go here */}
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          style={styles.avatarModel}
        >
          <Icon name="robot" size={64} color="#FFFFFF" />
        </LinearGradient>
      </View>
      
      <Text style={styles.avatarName}>{myAvatar.name}</Text>
      
      <View style={styles.avatarStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={styles.statValue}>{myAvatar.stats.level}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{myAvatar.stats.experience}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Rep</Text>
          <Text style={styles.statValue}>{myAvatar.stats.reputation}</Text>
        </View>
      </View>
      
      <View style={styles.achievements}>
        {myAvatar.stats.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementBadge}>
            <Text style={styles.achievementText}>🏆 {achievement}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.customizeButton} onPress={customizeAvatar}>
        <Icon name="palette" size={20} color={MetrTheme.colors.primary.electric} />
        <Text style={styles.customizeButtonText}>Customize Avatar</Text>
      </TouchableOpacity>
    </GlassCard>
  );

  const renderDigitalAssets = () => (
    <View style={styles.assetsSection}>
      <Text style={styles.sectionTitle}>💎 Digital Assets</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {digitalAssets.map(asset => (
          <GlassCard key={asset.id} style={styles.assetCard}>
            <View style={[styles.rarityIndicator, {backgroundColor: getRarityColor(asset.rarity)}]} />
            
            <View style={styles.assetIcon}>
              <Icon 
                name={
                  asset.type === 'wearable' ? 'tshirt-crew' :
                  asset.type === 'vehicle' ? 'car-sports' :
                  asset.type === 'pet' ? 'paw' :
                  asset.type === 'furniture' ? 'sofa' : 'map'
                }
                size={32}
                color={MetrTheme.colors.primary.electric}
              />
            </View>
            
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetRarity}>{asset.rarity.toUpperCase()}</Text>
            
            <View style={styles.assetValue}>
              <Icon name="ethereum" size={16} color={MetrTheme.colors.primary.teal} />
              <Text style={styles.assetValueText}>{asset.value}</Text>
            </View>
            
            {asset.isNFT ? (
              <View style={styles.nftBadge}>
                <Text style={styles.nftText}>NFT</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.mintButton}
                onPress={() => mintAssetAsNFT(asset)}
              >
                <Text style={styles.mintButtonText}>Mint NFT</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );

  const renderVRMode = () => {
    if (!isInVR || !currentWorld) return null;

    return (
      <View style={styles.vrMode}>
        <LinearGradient
          colors={['#000000', '#1F2937', '#111827']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.vrHeader}>
          <Text style={styles.vrWorldName}>{currentWorld.name}</Text>
          <TouchableOpacity onPress={exitWorld} style={styles.exitVRButton}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.vrContent}>
          {/* 3D Scene would render here */}
          <Text style={styles.vrPlaceholder}>🥽 VR Experience Active</Text>
          <Text style={styles.vrInstruction}>Use hand gestures to interact</Text>
          
          <View style={styles.vrControls}>
            <TouchableOpacity style={styles.vrControl}>
              <Icon name="walk" size={32} color="#FFFFFF" />
              <Text style={styles.vrControlText}>Move</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vrControl}>
              <Icon name="gesture-tap" size={32} color="#FFFFFF" />
              <Text style={styles.vrControlText}>Interact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vrControl}>
              <Icon name="microphone" size={32} color="#FFFFFF" />
              <Text style={styles.vrControlText}>Voice</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.vrFooter}>
          <Text style={styles.vrParticipants}>
            {currentWorld.participants} people in this world
          </Text>
        </View>
      </View>
    );
  };

  if (isInVR) {
    return renderVRMode();
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={MetrTheme.colors.gradients.dark}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Metaverse Portal</Text>
        <Text style={styles.subtitle}>Your gateway to virtual worlds</Text>
      </View>
      
      {renderAvatarProfile()}
      {renderWorldExplorer()}
      {renderDigitalAssets()}
      
      {/* Holographic Display */}
      <GlassCard style={styles.holographicCard}>
        <Text style={styles.holographicTitle}>🔮 Holographic Meeting</Text>
        <Text style={styles.holographicDescription}>
          Project yourself as a hologram in real spaces
        </Text>
        <TouchableOpacity style={styles.holographicButton}>
          <Text style={styles.holographicButtonText}>Start Projection</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  subtitle: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  worldExplorer: {
    padding: 20,
  },
  worldCard: {
    padding: 16,
    marginBottom: 12,
  },
  worldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  worldName: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  worldTheme: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  worldStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  worldParticipants: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginLeft: 4,
  },
  worldFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 11,
    color: MetrTheme.colors.primary.teal,
  },
  enterButton: {
    flexDirection: 'row',
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  avatarCard: {
    margin: 20,
    padding: 20,
  },
  avatarPreview: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarModel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 24,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    textAlign: 'center',
  },
  avatarStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  achievementBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  achievementText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  customizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.primary.electric,
    marginLeft: 8,
  },
  assetsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  assetCard: {
    width: 150,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  assetIcon: {
    marginTop: 8,
    marginBottom: 12,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    textAlign: 'center',
  },
  assetRarity: {
    fontSize: 10,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  assetValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  assetValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginLeft: 4,
  },
  nftBadge: {
    backgroundColor: MetrTheme.colors.primary.pink,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  nftText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mintButton: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  mintButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: MetrTheme.colors.primary.teal,
  },
  holographicCard: {
    margin: 20,
    padding: 20,
    alignItems: 'center',
  },
  holographicTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.primary.pink,
  },
  holographicDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  holographicButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  holographicButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  vrMode: {
    flex: 1,
  },
  vrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  vrWorldName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exitVRButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vrContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vrPlaceholder: {
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  vrInstruction: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 48,
  },
  vrControls: {
    flexDirection: 'row',
    gap: 32,
  },
  vrControl: {
    alignItems: 'center',
  },
  vrControlText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
  },
  vrFooter: {
    padding: 20,
    alignItems: 'center',
  },
  vrParticipants: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
