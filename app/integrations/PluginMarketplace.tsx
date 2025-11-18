// PluginMarketplace.tsx - AI Plugin Marketplace for METR
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'productivity' | 'integration' | 'analytics' | 'communication' | 'security';
  version: string;
  author: string;
  rating: number;
  downloads: number;
  price: number;
  isPremium: boolean;
  isInstalled: boolean;
  icon: string;
  screenshots: string[];
  features: string[];
  requirements: string[];
  size: number;
  lastUpdated: Date;
}

interface PluginReview {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

export const PluginMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: 'ai-writer',
      name: 'AI Content Writer',
      description: 'Advanced AI writing assistant for all content needs',
      category: 'ai',
      version: '2.1.0',
      author: 'METR Labs',
      rating: 4.8,
      downloads: 15420,
      price: 0,
      isPremium: false,
      isInstalled: false,
      icon: 'robot-outline',
      screenshots: [],
      features: ['Email drafting', 'Document generation', 'Code comments'],
      requirements: ['METR v1.5+'],
      size: 12.5,
      lastUpdated: new Date(),
    },
    {
      id: 'smart-scheduler',
      name: 'Smart Scheduler Pro',
      description: 'AI-powered meeting scheduler with timezone magic',
      category: 'productivity',
      version: '3.0.2',
      author: 'TimeWizard Inc',
      rating: 4.6,
      downloads: 8930,
      price: 9.99,
      isPremium: true,
      isInstalled: false,
      icon: 'calendar-clock',
      screenshots: [],
      features: ['Auto-scheduling', 'Conflict resolution', 'Time zone sync'],
      requirements: ['METR v1.4+', 'Calendar access'],
      size: 8.2,
      lastUpdated: new Date(),
    },
    {
      id: 'blockchain-logger',
      name: 'Blockchain Activity Logger',
      description: 'Immutable audit trail using blockchain technology',
      category: 'security',
      version: '1.0.5',
      author: 'CryptoSec',
      rating: 4.9,
      downloads: 3250,
      price: 19.99,
      isPremium: true,
      isInstalled: true,
      icon: 'shield-lock',
      screenshots: [],
      features: ['Immutable logs', 'Smart contracts', 'Audit reports'],
      requirements: ['METR v2.0+', 'Web3 enabled'],
      size: 15.7,
      lastUpdated: new Date(),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'new' | 'price'>('popular');
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);

  useEffect(() => {
    loadInstalledPlugins();
  }, []);

  const loadInstalledPlugins = async () => {
    try {
      const installed = await AsyncStorage.getItem('installed_plugins');
      if (installed) {
        setInstalledPlugins(JSON.parse(installed));
      }
    } catch (error) {
      console.error('Failed to load installed plugins:', error);
    }
  };

  const installPlugin = async (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    // Simulate installation
    const updatedPlugins = plugins.map(p => 
      p.id === pluginId ? {...p, isInstalled: true} : p
    );
    setPlugins(updatedPlugins);

    const updatedInstalled = [...installedPlugins, pluginId];
    setInstalledPlugins(updatedInstalled);
    await AsyncStorage.setItem('installed_plugins', JSON.stringify(updatedInstalled));
  };

  const uninstallPlugin = async (pluginId: string) => {
    const updatedPlugins = plugins.map(p => 
      p.id === pluginId ? {...p, isInstalled: false} : p
    );
    setPlugins(updatedPlugins);

    const updatedInstalled = installedPlugins.filter(id => id !== pluginId);
    setInstalledPlugins(updatedInstalled);
    await AsyncStorage.setItem('installed_plugins', JSON.stringify(updatedInstalled));
  };

  const categories = [
    {id: 'ai', name: 'AI & ML', icon: 'robot', color: MetrTheme.colors.primary.electric},
    {id: 'productivity', name: 'Productivity', icon: 'rocket', color: MetrTheme.colors.primary.teal},
    {id: 'integration', name: 'Integrations', icon: 'link', color: '#F59E0B'},
    {id: 'analytics', name: 'Analytics', icon: 'chart-line', color: '#10B981'},
    {id: 'communication', name: 'Communication', icon: 'message', color: MetrTheme.colors.primary.pink},
    {id: 'security', name: 'Security', icon: 'shield', color: '#EF4444'},
  ];

  const getFilteredPlugins = () => {
    let filtered = plugins;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'new':
        filtered.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
    }

    return filtered;
  };

  const renderPlugin = (plugin: Plugin) => (
    <GlassCard key={plugin.id} style={styles.pluginCard}>
      <View style={styles.pluginHeader}>
        <View style={[styles.pluginIcon, {backgroundColor: getCategoryColor(plugin.category) + '20'}]}>
          <Icon name={plugin.icon} size={32} color={getCategoryColor(plugin.category)} />
        </View>
        <View style={styles.pluginInfo}>
          <Text style={styles.pluginName}>{plugin.name}</Text>
          <Text style={styles.pluginAuthor}>by {plugin.author}</Text>
          <View style={styles.pluginMeta}>
            <View style={styles.rating}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{plugin.rating}</Text>
            </View>
            <Text style={styles.downloads}>{formatNumber(plugin.downloads)} downloads</Text>
          </View>
        </View>
        <View style={styles.pluginPrice}>
          {plugin.price === 0 ? (
            <Text style={styles.freeText}>FREE</Text>
          ) : (
            <Text style={styles.priceText}>${plugin.price}</Text>
          )}
        </View>
      </View>

      <Text style={styles.pluginDescription}>{plugin.description}</Text>

      <View style={styles.pluginFeatures}>
        {plugin.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureChip}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pluginFooter}>
        <Text style={styles.pluginSize}>{plugin.size} MB</Text>
        <Text style={styles.pluginVersion}>v{plugin.version}</Text>
        
        {plugin.isInstalled ? (
          <View style={styles.installedActions}>
            <TouchableOpacity style={styles.openButton}>
              <Text style={styles.openButtonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uninstallButton}
              onPress={() => uninstallPlugin(plugin.id)}
            >
              <Icon name="delete-outline" size={20} color={MetrTheme.colors.semantic.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.installButton}
            onPress={() => installPlugin(plugin.id)}
          >
            <Text style={styles.installButtonText}>Install</Text>
          </TouchableOpacity>
        )}
      </View>
    </GlassCard>
  );

  const getCategoryColor = (category: string): string => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || MetrTheme.colors.dark.textSecondary;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏪 Plugin Marketplace</Text>
        <Text style={styles.subtitle}>Extend METR with powerful plugins</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={20} color={MetrTheme.colors.dark.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plugins..."
          placeholderTextColor={MetrTheme.colors.dark.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(
              selectedCategory === category.id ? null : category.id
            )}
          >
            <Icon name={category.icon} size={18} color={
              selectedCategory === category.id ? '#FFFFFF' : category.color
            } />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextSelected,
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['popular', 'rating', 'new', 'price'] as const).map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
            onPress={() => setSortBy(option)}
          >
            <Text style={[
              styles.sortText,
              sortBy === option && styles.sortTextActive,
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Banner */}
      <GlassCard style={styles.featuredBanner}>
        <Text style={styles.featuredTitle}>🌟 Featured Plugin</Text>
        <Text style={styles.featuredName}>Quantum Task Optimizer</Text>
        <Text style={styles.featuredDescription}>
          Use quantum computing algorithms to optimize task scheduling
        </Text>
        <TouchableOpacity style={styles.featuredButton}>
          <Text style={styles.featuredButtonText}>Learn More</Text>
        </TouchableOpacity>
      </GlassCard>

      {/* Plugins List */}
      <View style={styles.pluginsList}>
        {getFilteredPlugins().map(plugin => renderPlugin(plugin))}
      </View>

      {/* Create Plugin CTA */}
      <GlassCard style={styles.createCTA}>
        <Icon name="code-tags" size={48} color={MetrTheme.colors.primary.electric} />
        <Text style={styles.createTitle}>Build Your Own Plugin</Text>
        <Text style={styles.createDescription}>
          Join our developer community and create plugins for METR
        </Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Developer Portal</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  subtitle: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
  },
  categories: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: MetrTheme.colors.primary.electric,
  },
  categoryText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginLeft: 6,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginRight: 12,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  sortText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  sortTextActive: {
    color: MetrTheme.colors.primary.electric,
    fontWeight: '600',
  },
  featuredBanner: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 16,
  },
  featuredButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  featuredButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pluginsList: {
    paddingHorizontal: 20,
  },
  pluginCard: {
    padding: 16,
    marginBottom: 12,
  },
  pluginHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pluginIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pluginInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pluginName: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  pluginAuthor: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  pluginMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
    marginLeft: 4,
  },
  downloads: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  pluginPrice: {
    alignItems: 'flex-end',
  },
  freeText: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.semantic.success,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  pluginDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 12,
  },
  pluginFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureChip: {
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
  pluginFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pluginSize: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginRight: 12,
  },
  pluginVersion: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    flex: 1,
  },
  installButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  installButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  installedActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  openButtonText: {
    color: MetrTheme.colors.primary.electric,
    fontSize: 14,
    fontWeight: '600',
  },
  uninstallButton: {
    padding: 8,
  },
  createCTA: {
    margin: 20,
    padding: 24,
    alignItems: 'center',
  },
  createTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginTop: 16,
  },
  createDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
