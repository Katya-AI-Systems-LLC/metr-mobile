// SearchEngine.ts - Advanced Search Engine for METR
import Fuse from 'fuse.js';
import {DeviceEventEmitter} from 'react-native';
import {METRCache} from '../cache/METRCache';

interface SearchResult {
  id: string;
  type: 'message' | 'user' | 'channel' | 'file' | 'task' | 'meeting';
  title: string;
  description: string;
  relevance: number;
  metadata: Record<string, any>;
}

interface SearchConfig {
  enableFuzzySearch: boolean;
  enableIndexing: boolean;
  maxResults: number;
  minRelevance: number;
  enableCache: boolean;
}

export class SearchEngine {
  private static instance: SearchEngine;
  private config: SearchConfig;
  private cache: METRCache;
  private indexes: Map<string, Fuse<any>> = new Map();
  private searchHistory: string[] = [];

  private constructor() {
    this.config = {
      enableFuzzySearch: true,
      enableIndexing: true,
      maxResults: 50,
      minRelevance: 0.3,
      enableCache: true,
    };

    this.cache = METRCache.getInstance();
    this.setupIndexes();
  }

  public static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }

  // Setup search indexes
  private setupIndexes(): void {
    // Initialize indexes for different types
    const indexConfig = {
      threshold: 0.3,
      keys: ['title', 'description', 'content'],
    };

    this.indexes.set('messages', new Fuse([], indexConfig));
    this.indexes.set('users', new Fuse([], indexConfig));
    this.indexes.set('channels', new Fuse([], indexConfig));
    this.indexes.set('files', new Fuse([], indexConfig));
    this.indexes.set('tasks', new Fuse([], indexConfig));
  }

  // Index data
  public indexData(type: string, data: any[]): void {
    if (!this.config.enableIndexing) {
      return;
    }

    const index = this.indexes.get(type);
    if (index) {
      index.setCollection(data);
    }
  }

  // Search
  public async search(
    query: string,
    types?: string[],
    filters?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    // Check cache
    if (this.config.enableCache) {
      const cacheKey = `search_${query}_${JSON.stringify(types)}_${JSON.stringify(filters)}`;
      const cached = await this.cache.get<SearchResult[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const results: SearchResult[] = [];
    const searchTypes = types || ['messages', 'users', 'channels', 'files', 'tasks'];

    // Search each type
    for (const type of searchTypes) {
      const typeResults = await this.searchType(type, query, filters);
      results.push(...typeResults);
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Limit results
    const limitedResults = results.slice(0, this.config.maxResults);

    // Filter by minimum relevance
    const filteredResults = limitedResults.filter(
      result => result.relevance >= this.config.minRelevance
    );

    // Cache results
    if (this.config.enableCache) {
      const cacheKey = `search_${query}_${JSON.stringify(types)}_${JSON.stringify(filters)}`;
      await this.cache.set(cacheKey, filteredResults, 300000); // 5 minutes
    }

    // Save to history
    this.searchHistory.push(query);
    if (this.searchHistory.length > 100) {
      this.searchHistory.shift();
    }

    DeviceEventEmitter.emit('search_completed', {query, results: filteredResults});

    return filteredResults;
  }

  // Search specific type
  private async searchType(
    type: string,
    query: string,
    filters?: Record<string, any>
  ): Promise<SearchResult[]> {
    const index = this.indexes.get(type);
    if (!index) {
      return [];
    }

    const fuseResults = index.search(query);
    
    return fuseResults.map((result: any) => ({
      id: result.item.id || result.refIndex.toString(),
      type: type.slice(0, -1) as SearchResult['type'], // Remove 's' from plural
      title: result.item.title || result.item.name || '',
      description: result.item.description || result.item.content || '',
      relevance: 1 - result.score, // Convert score to relevance
      metadata: {
        ...result.item,
        matchScore: result.score,
      },
    }));
  }

  // Advanced search with operators
  public async advancedSearch(
    query: string,
    operators: {
      exact?: string[];
      exclude?: string[];
      include?: string[];
      dateRange?: {start: Date; end: Date};
      author?: string;
    }
  ): Promise<SearchResult[]> {
    // Parse query with operators
    let searchQuery = query;

    // Handle exact matches
    if (operators.exact && operators.exact.length > 0) {
      operators.exact.forEach(term => {
        searchQuery += ` "${term}"`;
      });
    }

    // Handle exclusions
    if (operators.exclude && operators.exclude.length > 0) {
      operators.exclude.forEach(term => {
        searchQuery += ` -${term}`;
      });
    }

    // Perform search
    const results = await this.search(searchQuery);

    // Apply filters
    let filteredResults = results;

    if (operators.dateRange) {
      filteredResults = filteredResults.filter(result => {
        const resultDate = new Date(result.metadata.timestamp || 0);
        return (
          resultDate >= operators.dateRange!.start &&
          resultDate <= operators.dateRange!.end
        );
      });
    }

    if (operators.author) {
      filteredResults = filteredResults.filter(
        result => result.metadata.author === operators.author
      );
    }

    return filteredResults;
  }

  // Get search suggestions
  public getSuggestions(query: string): string[] {
    if (query.length < 2) {
      return [];
    }

    // Get from history
    const historyMatches = this.searchHistory.filter(
      term => term.toLowerCase().includes(query.toLowerCase())
    );

    // Get common searches
    const commonSearches = [
      'meeting notes',
      'project tasks',
      'team members',
      'recent files',
    ];

    const commonMatches = commonSearches.filter(
      term => term.toLowerCase().includes(query.toLowerCase())
    );

    return [...new Set([...historyMatches, ...commonMatches])].slice(0, 5);
  }

  // Get search history
  public getHistory(): string[] {
    return [...this.searchHistory];
  }

  // Clear search history
  public clearHistory(): void {
    this.searchHistory = [];
  }

  // Configure search engine
  public configure(config: Partial<SearchConfig>): void {
    this.config = {...this.config, ...config};
  }
}

export default SearchEngine;


